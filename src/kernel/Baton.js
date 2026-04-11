/**
 * SOVEREIGN KERNEL — BATON PROTOCOL (B-1)
 * Implementation of the cryptographically signed unit of work.
 */

export class Baton {
  constructor(origin, nextAgent, payload = {}) {
    this.header = {
      baton_id: crypto.randomUUID(),
      origin: origin,
      timestamp: new Date().toISOString(),
      priority: 1.0,
      sovereignty_tag: "Benin_Sovereign_Strict"
    };
    this.payload = payload;
    this.audit = {
      recursion_depth: 0,
      confidence_score: 0.0,
      shadow_critique_log: []
    };
    this.routing = {
      current_agent: origin,
      next_agent: nextAgent,
      fallback_agent: "Agent-03-Orchestrator"
    };
    this.signature = null;
  }

  /**
   * Signs the baton using a sovereign key.
   * In a real environment, 'key' would be a CryptoKey object.
   */
  async sign(key) {
    const encoder = new TextEncoder();
    // Using a sorted key approach for deterministic stringification
    const deterministicContent = JSON.stringify({
      header: this.header,
      payload: this.payload,
      audit: this.audit,
      routing: this.routing
    }, Object.keys(this).sort());

    const data = encoder.encode(deterministicContent);

    const signature = await crypto.subtle.sign(
      { name: "HMAC" },
      key,
      data
    );

    this.signature = btoa(String.fromCharCode(...new Uint8Array(signature)));
    return this;
  }

  /**
   * Verifies the baton's integrity.
   */
  static async verify(batonData, key) {
    const { signature, ...content } = batonData;
    if (!signature) return false;

    const encoder = new TextEncoder();
    const deterministicContent = JSON.stringify(content, Object.keys(content).sort());
    const data = encoder.encode(deterministicContent);
    const sigArray = Uint8Array.from(atob(signature), c => c.charCodeAt(0));

    return await crypto.subtle.verify(
      { name: "HMAC" },
      key,
      sigArray,
      data
    );
  }

  addAudit(logEntry, confidence) {
    this.audit.shadow_critique_log.push(logEntry);
    this.audit.confidence_score = confidence;
    this.audit.recursion_depth++;
  }
}
