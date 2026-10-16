'use strict';

const MAX_SKEW_MS = 60 * 60 * 1000;
const ISO_WITH_ZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-](?:0\d|1\d|2[0-3]):[0-5]\d)$/;

function parseZonedInstant(value, label) {
  if (typeof value !== 'string' || !ISO_WITH_ZONE.test(value)) {
    throw new Error(label + ' debe ser una fecha ISO completa con zona horaria');
  }
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) throw new Error(label + ' no es una fecha válida');
  return ms;
}

function validateEvidenceCut({ month, cutoff, cloudMonth, cloudExportedAt, htmlSnapshotAt = null }) {
  if (typeof month !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new Error('--month debe ser un periodo válido AAAA-MM');
  }
  if (cloudMonth !== month) {
    throw new Error('El mes de la exportación de nube (' + (cloudMonth || 'ausente') + ') no coincide con --month (' + month + ')');
  }
  const cutMs = parseZonedInstant(cutoff, '--cutoff');
  const cloudMs = parseZonedInstant(cloudExportedAt, 'exported_at de la nube');
  let htmlMs = null;
  if (htmlSnapshotAt !== null) {
    htmlMs = parseZonedInstant(htmlSnapshotAt, 'fecha de la copia HTML');
    if (Math.abs(cloudMs - htmlMs) > MAX_SKEW_MS) {
      throw new Error('Las copias HTML y nube difieren más de 1 h; no se genera informe');
    }
  }
  if (Math.abs(cutMs - cloudMs) > MAX_SKEW_MS) {
    throw new Error('--cutoff está a más de 1 h de la exportación de nube; no se genera informe');
  }
  if (htmlMs !== null && Math.abs(cutMs - htmlMs) > MAX_SKEW_MS) {
    throw new Error('--cutoff está a más de 1 h de la copia HTML; no se genera informe');
  }
  return true;
}

module.exports = { MAX_SKEW_MS, parseZonedInstant, validateEvidenceCut };
