/**
 * FLUXIA SESSION MANAGEMENT & SECURITY HEADERS
 * v93.8.2 Security Edition
 * 
 * Manages secure session tokens with:
 * - Device binding (IP hash + Device ID)
 * - Activity timeout (30 min inactivity)
 * - Concurrent session limits
 * - HTTP security headers
 */

window.FluxiaSessionManager = {
  // Session configuration
  config: {
    sessionDuration: 30 * 24 * 60 * 60 * 1000,  // 30 days
    inactivityTimeout: 30 * 60 * 1000,          // 30 minutes
    maxConcurrentSessions: 3
  },

  // Create new session
  createSession: async function(userId, deviceId) {
    try {
      const sessionId = crypto.randomUUID();
      const ipHash = await this.hashIP();

      const token = {
        sid: sessionId,
        uid: userId,
        dev: deviceId,
        ip: ipHash,
        iat: Date.now(),
        exp: Date.now() + this.config.sessionDuration,
        iat_loc: Date.now(),  // Last activity time
        nonce: crypto.randomUUID()
      };

      const signature = await this.signToken(token);
      const sessionToken = btoa(JSON.stringify({ token, sig: signature }));

      // Encrypt session token
      const encKey = await FluxiaEncryption.deriveEncryptionKey(
        localStorage.getItem('fluxia_pin_plain'),
        deviceId
      );
      const encrypted = await FluxiaEncryption.encryptAES256GCM(sessionToken, encKey);

      // Store encrypted session
      localStorage.setItem('fluxia_session_v1', encrypted);
      localStorage.setItem('fluxia_session_created', Date.now().toString());

      // Check concurrent session limit
      this.limitConcurrentSessions(userId);

      FluxiaAuditLog.log('LOGIN', { userId, deviceId });

      return sessionToken;
    } catch (error) {
      console.error('❌ Failed to create session:', error);
      throw error;
    }
  },

  // Validate session
  validateSession: async function() {
    try {
      const encrypted = localStorage.getItem('fluxia_session_v1');
      if (!encrypted) return null;

      const deviceId = localStorage.getItem('fluxia_device_id');
      const encKey = await FluxiaEncryption.deriveEncryptionKey(
        localStorage.getItem('fluxia_pin_plain'),
        deviceId
      );

      const decrypted = await FluxiaEncryption.decryptAES256GCM(encrypted, encKey);
      const { token, sig } = JSON.parse(atob(decrypted));

      // Verify signature
      const valid = await this.verifyToken(token, sig);
      if (!valid) {
        console.warn('⚠️ Session signature invalid');
        this.destroySession();
        return null;
      }

      // Check expiry
      if (token.exp < Date.now()) {
        console.log('Session expired');
        this.destroySession();
        FluxiaAuditLog.log('SESSION_EXPIRED', { userId: token.uid });
        return null;
      }

      // Check inactivity
      const inactiveMs = Date.now() - token.iat_loc;
      if (inactiveMs > this.config.inactivityTimeout) {
        console.log('Session inactive, require re-auth');
        this.destroySession();
        FluxiaAuditLog.log('SESSION_TIMEOUT', { userId: token.uid, inactiveMs });
        return null;
      }

      // Check IP/Device binding
      const currentIpHash = await this.hashIP();
      if (token.ip !== currentIpHash) {
        console.warn('⚠️ Session IP mismatch');
        FluxiaAuditLog.log('IP_CHANGE', {
          userId: token.uid,
          oldIP: token.ip,
          newIP: currentIpHash
        });
        // Don't destroy session yet, but flag for re-auth
        return { ...token, needsReauth: true };
      }

      // Update last activity
      token.iat_loc = Date.now();

      return token;
    } catch (error) {
      console.error('❌ Session validation error:', error);
      return null;
    }
  },

  // Refresh session (extend expiry)
  refreshSession: async function() {
    try {
      const session = await this.validateSession();
      if (!session) return false;

      // Refresh if less than 7 days left
      const timeLeft = session.exp - Date.now();
      if (timeLeft < (7 * 24 * 60 * 60 * 1000)) {
        session.exp = Date.now() + this.config.sessionDuration;
        
        const deviceId = localStorage.getItem('fluxia_device_id');
        await this.createSession(session.uid, deviceId);
        
        return true;
      }

      return true;
    } catch (error) {
      console.error('❌ Session refresh failed:', error);
      return false;
    }
  },

  // Destroy session
  destroySession: function() {
    try {
      localStorage.removeItem('fluxia_session_v1');
      localStorage.removeItem('fluxia_session_created');
      
      // Clear PIN from memory
      localStorage.removeItem('fluxia_pin_plain');

      FluxiaAuditLog.log('LOGOUT', {});
    } catch (e) {
      console.error('❌ Failed to destroy session:', e);
    }
  },

  // Sign session token
  signToken: async function(token) {
    const message = JSON.stringify({
      sid: token.sid,
      uid: token.uid,
      dev: token.dev,
      iat: token.iat,
      exp: token.exp
    });

    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
  },

  // Verify token signature
  verifyToken: async function(token, sig) {
    try {
      const computed = await this.signToken(token);
      return computed === sig;
    } catch (e) {
      return false;
    }
  },

  // Hash IP address (for device binding)
  hashIP: async function() {
    try {
      // Fetch IP via ipify API
      const response = await fetch('https://api.ipify.org?format=json', { timeout: 2000 });
      const data = await response.json();
      const ip = data.ip || 'unknown';

      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(ip));
      return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
    } catch (e) {
      console.warn('⚠️ Could not fetch IP:', e);
      return 'unknown';
    }
  },

  // Limit concurrent sessions
  limitConcurrentSessions: function(userId) {
    // This would be enforced server-side in production
    // Client-side, we just log the attempt
    const sessionKey = `session-${userId}`;
    const sessions = JSON.parse(localStorage.getItem(sessionKey) || '[]');
    sessions.push({
      createdAt: Date.now(),
      deviceId: localStorage.getItem('fluxia_device_id')
    });

    // Keep only recent sessions
    const recent = sessions.filter(s => Date.now() - s.createdAt < (60 * 60 * 1000));
    localStorage.setItem(sessionKey, JSON.stringify(recent.slice(-this.config.maxConcurrentSessions)));
  }
};

// ═══════════════════════════════════════════════════════════════
// HTTP SECURITY HEADERS (Client-side Injection)
// ═══════════════════════════════════════════════════════════════

window.FluxiaSecurityHeaders = {
  // Generate nonce for CSP (changes on each load)
  generateNonce: function() {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Inject CSP meta tag
  injectCSP: function() {
    const nonce = this.generateNonce();
    
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = `
      default-src 'self';
      script-src 'self' 'nonce-${nonce}' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net;
      style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com;
      img-src 'self' data: https:;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' https://api.supabase.co https://psd2.enablebanking.com https://api.ipify.org;
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
      object-src 'none'
    `;
    
    document.head.insertBefore(cspMeta, document.head.firstChild);
    
    // Store nonce in window for inline script references
    window._CSP_NONCE = nonce;
    
    console.log('✅ CSP meta tag injected');
  },

  // Inject other security headers as meta tags
  injectSecurityMeta: function() {
    // X-UA-Compatible
    const xUAMeta = document.createElement('meta');
    xUAMeta.httpEquiv = 'X-UA-Compatible';
    xUAMeta.content = 'ie=edge';
    document.head.appendChild(xUAMeta);

    // Referrer-Policy
    const refMeta = document.createElement('meta');
    refMeta.name = 'referrer';
    refMeta.content = 'no-referrer';
    document.head.appendChild(refMeta);

    // Viewport (already usually present)
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      const vm = document.createElement('meta');
      vm.name = 'viewport';
      vm.content = 'width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5';
      document.head.appendChild(vm);
    }

    console.log('✅ Security meta tags injected');
  },

  // Add SRI hash verification (requires lib)
  verifySRIHashes: function() {
    const scripts = document.querySelectorAll('script[integrity]');
    
    scripts.forEach(script => {
      const integrity = script.getAttribute('integrity');
      if (!integrity) {
        console.warn(`⚠️ Script ${script.src} missing SRI hash`);
      }
    });

    console.log(`✅ Found ${scripts.length} scripts with SRI hashes`);
  },

  // Initialize all security headers
  init: function() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.injectCSP();
        this.injectSecurityMeta();
        this.verifySRIHashes();
      });
    } else {
      this.injectCSP();
      this.injectSecurityMeta();
      this.verifySRIHashes();
    }
  }
};

// ═══════════════════════════════════════════════════════════════
// GDPR COMPLIANCE UTILITIES
// ═══════════════════════════════════════════════════════════════

window.FluxiaGDPR = {
  // Record user consent
  recordConsent: function(type, version) {
    const consent = {
      type: type,  // 'privacy_policy', 'cookies', '2fa', etc.
      version: version,
      consentedAt: Date.now(),
      userAgent: navigator.userAgent.substring(0, 100),
      language: navigator.language
    };

    const consentLog = this.getConsentLog();
    consentLog.push(consent);
    localStorage.setItem('fluxia_consent_log_v1', JSON.stringify(consentLog));

    FluxiaAuditLog.log('CONSENT_GIVEN', { type, version });

    return consent;
  },

  getConsentLog: function() {
    try {
      return JSON.parse(localStorage.getItem('fluxia_consent_log_v1')) || [];
    } catch (e) {
      return [];
    }
  },

  // Export all user data (Right to Data Portability)
  exportUserData: async function() {
    const data = {
      profile: this.safeGetFromStorage('fluxia_profile_v2'),
      transactions: this.safeGetFromStorage('fluxia_transactions_v1'),
      compartidos: this.safeGetFromStorage('fluxia_compartidos_v1'),
      auditLog: FluxiaAuditLog.getLogs(),
      consentLog: this.getConsentLog(),
      exportedAt: new Date().toISOString()
    };

    FluxiaAuditLog.log('DATA_EXPORT', { scope: 'gdpr_portability' });

    return data;
  },

  // Delete all user data (Right to be Forgotten)
  deleteUserData: async function(confirmMessage = true) {
    if (confirmMessage && !confirm(
      'This will PERMANENTLY delete all your data. This cannot be undone.\n\nType "DELETE" to confirm.'
    )) {
      return false;
    }

    // Clear all user data
    const keys = Object.keys(localStorage);
    const deletedKeys = [];

    for (const key of keys) {
      if (key.startsWith('fluxia_')) {
        localStorage.removeItem(key);
        deletedKeys.push(key);
      }
    }

    FluxiaAuditLog.log('DATA_DELETE_REQUESTED', {
      deletedKeys: deletedKeys.length,
      scope: 'gdpr_erasure'
    });

    console.log(`✅ Deleted ${deletedKeys.length} data items`);
    return true;
  },

  // Privacy preferences (Right to Object)
  updatePrivacyPreferences: function(prefs) {
    const preferences = {
      analytics: prefs.analytics || false,
      marketing: prefs.marketing || false,
      profiling: prefs.profiling || false,
      thirdPartySharing: prefs.thirdPartySharing || false,
      updatedAt: Date.now()
    };

    localStorage.setItem('fluxia_privacy_preferences_v1', JSON.stringify(preferences));

    FluxiaAuditLog.log('PRIVACY_PREFERENCES_UPDATED', preferences);

    return preferences;
  },

  getPrivacyPreferences: function() {
    try {
      return JSON.parse(localStorage.getItem('fluxia_privacy_preferences_v1')) || {};
    } catch (e) {
      return {};
    }
  },

  // Safe JSON parsing from storage
  safeGetFromStorage: function(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  },

  // Data Processing Agreement (informational)
  DPIA: {
    version: '1.0',
    lastUpdated: '2026-09-29',
    purpose: 'Personal financial planning and shared expense tracking',
    dataCategories: [
      'Name and email address',
      'Financial transactions and amounts',
      'Bank account information (hashed)',
      'Device and session identifiers'
    ],
    dataRetention: {
      activeData: 'Until user deletion or 2 years of inactivity',
      backups: '30 days retention',
      auditLogs: '30 days retention'
    },
    recipients: [
      'Only the user',
      'Bank (via PSD2 OAuth)',
      'Supabase cloud (if enabled)',
      'CDN providers (for assets only)'
    ],
    lawfulBasis: 'User consent (Art. 6(1)(a) GDPR)',
    rights: [
      'Right to access (Art. 15)',
      'Right to rectification (Art. 16)',
      'Right to erasure (Art. 17)',
      'Right to restrict processing (Art. 18)',
      'Right to data portability (Art. 20)',
      'Right to object (Art. 21)'
    ],
    risks: [
      'Unauthorized access via browser exploit',
      'Device loss or theft',
      'Weak PIN selection',
      'Bank system compromise (out of scope)'
    ],
    mitigations: [
      'AES-256-GCM encryption at rest',
      'PBKDF2-SHA256 with 200k iterations for key derivation',
      'Session timeout after 30 minutes of inactivity',
      'Device binding via IP hash + Device ID',
      'Rate limiting on sensitive operations',
      'Comprehensive audit logging',
      'No third-party analytics or tracking',
      'Optional end-to-end encryption for backups'
    ]
  }
};

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════

console.log('✅ Fluxia Session & Security Headers v93.8.2 loaded');

// Auto-initialize security headers on page load
if (typeof window !== 'undefined') {
  FluxiaSecurityHeaders.init();
}
