DO $qa$
DECLARE n integer; r json; a uuid := '11111111-1111-4111-8111-111111111111'; b uuid := '22222222-2222-4222-8222-222222222222'; c uuid := '33333333-3333-4333-8333-333333333333'; d uuid := '44444444-4444-4444-8444-444444444444';
BEGIN
CREATE SCHEMA fluxia_qa_elite_20261013;
CREATE TABLE fluxia_qa_elite_20261013.fluxia_contactos (id uuid primary key,user_id_1 uuid not null,user_id_2 uuid not null,estado text,gasto_invite_token text,fecha_creacion timestamptz,fecha_aceptacion timestamptz);
GRANT USAGE ON SCHEMA fluxia_qa_elite_20261013 TO anon, authenticated;
GRANT SELECT,UPDATE,INSERT ON fluxia_qa_elite_20261013.fluxia_contactos TO anon, authenticated;
CREATE POLICY own_contact_select ON fluxia_qa_elite_20261013.fluxia_contactos FOR SELECT USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);
CREATE POLICY own_contact_update ON fluxia_qa_elite_20261013.fluxia_contactos FOR UPDATE USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2) WITH CHECK (auth.uid() = user_id_1 OR auth.uid() = user_id_2);
INSERT INTO fluxia_qa_elite_20261013.fluxia_contactos VALUES (a,a,b,'pendiente','qa-token-A-B',now(),null),(c,c,d,'pendiente','qa-token-C-D',now(),null);
EXECUTE 'CREATE OR REPLACE FUNCTION fluxia_qa_elite_20261013.accept_invitation(token_input text, usuario_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_contacto_id UUID;
  v_user_id_1 UUID;
BEGIN
  -- Buscar la invitación pendiente
  SELECT id, user_id_1 INTO v_contacto_id, v_user_id_1
  FROM fluxia_qa_elite_20261013.fluxia_contactos
  WHERE gasto_invite_token = token_input AND estado = ''pendiente''
  LIMIT 1;

  IF v_contacto_id IS NULL THEN
    RETURN json_build_object(''success'', false, ''error'', ''Invitación no encontrada o ya procesada'');
  END IF;

  -- Actualizar el estado a aceptado
  UPDATE fluxia_qa_elite_20261013.fluxia_contactos
  SET estado = ''aceptado'', fecha_aceptacion = now()
  WHERE id = v_contacto_id AND user_id_2 = usuario_id;

  RETURN json_build_object(
    ''success'', true,
    ''contacto_id'', v_contacto_id,
    ''usuario_invitador'', v_user_id_1,
    ''mensaje'', ''Invitación aceptada''
  );
END;
$function$
';
PERFORM set_config('role','anon',true); PERFORM set_config('request.jwt.claims','{}',true); PERFORM set_config('request.jwt.claim.sub','',true);
SELECT count(*) INTO n FROM fluxia_qa_elite_20261013.fluxia_contactos;
IF n <> 2 THEN RAISE EXCEPTION 'Before test did not reproduce unprotected contacts'; END IF;
SELECT fluxia_qa_elite_20261013.accept_invitation('qa-token-A-B',c) INTO r;
IF r->>'success' <> 'true' THEN RAISE EXCEPTION 'Before test did not reproduce false RPC success'; END IF;
PERFORM set_config('role','postgres',true);
ALTER TABLE fluxia_qa_elite_20261013.fluxia_contactos ENABLE ROW LEVEL SECURITY;
EXECUTE 'CREATE OR REPLACE FUNCTION fluxia_qa_elite_20261013.accept_invitation(token_input text, usuario_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''''
AS $function$
DECLARE
  caller uuid := auth.uid();
  v_contacto_id uuid;
  v_user_id_1 uuid;
BEGIN
  IF caller IS NULL OR usuario_id IS DISTINCT FROM caller THEN
    RAISE EXCEPTION ''Unauthorized invitation recipient'' USING ERRCODE = ''42501'';
  END IF;
  SELECT id, user_id_1 INTO v_contacto_id, v_user_id_1
  FROM fluxia_qa_elite_20261013.fluxia_contactos
  WHERE gasto_invite_token = token_input AND estado = ''pendiente''
    AND user_id_2 = caller
  FOR UPDATE;
  IF v_contacto_id IS NULL THEN
    RETURN json_build_object(''success'', false, ''error'', ''Invitación no encontrada o ya procesada'');
  END IF;
  UPDATE fluxia_qa_elite_20261013.fluxia_contactos
  SET estado = ''aceptado'', fecha_aceptacion = now()
  WHERE id = v_contacto_id AND user_id_2 = caller AND estado = ''pendiente'';
  IF NOT FOUND THEN
    RETURN json_build_object(''success'', false, ''error'', ''Invitación no encontrada o ya procesada'');
  END IF;
  RETURN json_build_object(''success'', true, ''contacto_id'', v_contacto_id,
    ''usuario_invitador'', v_user_id_1, ''mensaje'', ''Invitación aceptada'');
END;
$function$;';
REVOKE EXECUTE ON FUNCTION fluxia_qa_elite_20261013.accept_invitation(text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION fluxia_qa_elite_20261013.accept_invitation(text,uuid) TO authenticated;
PERFORM set_config('role','anon',true);
SELECT count(*) INTO n FROM fluxia_qa_elite_20261013.fluxia_contactos; IF n <> 0 THEN RAISE EXCEPTION 'Anon can read protected contacts'; END IF;
BEGIN
 PERFORM fluxia_qa_elite_20261013.accept_invitation('qa-token-A-B',b);
 RAISE EXCEPTION 'Anon can execute RPC';
EXCEPTION WHEN insufficient_privilege THEN NULL; END;
PERFORM set_config('role','authenticated',true);
PERFORM set_config('request.jwt.claim.sub',a::text,true);
SELECT count(*) INTO n FROM fluxia_qa_elite_20261013.fluxia_contactos; IF n <> 1 THEN RAISE EXCEPTION 'A does not see exactly its own contact'; END IF;
BEGIN
 PERFORM fluxia_qa_elite_20261013.accept_invitation('qa-token-A-B',b);
 RAISE EXCEPTION 'A can impersonate B';
EXCEPTION WHEN insufficient_privilege THEN NULL; END;
SELECT fluxia_qa_elite_20261013.accept_invitation('qa-token-A-B',a) INTO r;
IF r->>'success' <> 'false' THEN RAISE EXCEPTION 'Sender can accept recipient token'; END IF;
PERFORM set_config('request.jwt.claim.sub',b::text,true);
SELECT count(*) INTO n FROM fluxia_qa_elite_20261013.fluxia_contactos; IF n <> 1 THEN RAISE EXCEPTION 'B own visibility broken'; END IF;
SELECT fluxia_qa_elite_20261013.accept_invitation('qa-token-A-B',b) INTO r;
IF r->>'success' <> 'true' THEN RAISE EXCEPTION 'Recipient cannot accept invitation'; END IF;
SELECT fluxia_qa_elite_20261013.accept_invitation('qa-token-A-B',b) INTO r;
IF r->>'success' <> 'false' THEN RAISE EXCEPTION 'Repeated invitation not idempotent'; END IF;
SELECT fluxia_qa_elite_20261013.accept_invitation('does-not-exist',b) INTO r;
IF r->>'success' <> 'false' THEN RAISE EXCEPTION 'Unknown token returns success'; END IF;
PERFORM set_config('request.jwt.claim.sub','55555555-5555-4555-8555-555555555555',true);
SELECT count(*) INTO n FROM fluxia_qa_elite_20261013.fluxia_contactos; IF n <> 0 THEN RAISE EXCEPTION 'Unrelated account can read contacts'; END IF;
PERFORM set_config('role','postgres',true);
DROP SCHEMA fluxia_qa_elite_20261013 CASCADE;
END $qa$;
SELECT json_build_object('synthetic_schema_removed',true,'before_vulnerabilities_reproduced',2,'after_assertions_passed',9,'real_user_rows_read',0,'real_user_rows_written',0) AS security_regression;
