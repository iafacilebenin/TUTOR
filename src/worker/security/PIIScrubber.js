/**
 * SOVEREIGN SECURITY — PII SCRUBBER
 * Ensures student data remains within the Benin Sovereign territory.
 */

export class PIIScrubber {
  /**
   * Scrubs sensitive information before data leaves the sovereign environment.
   */
  static scrub(text, rules = []) {
    let scrubbed = text;

    // Standard PII: Emails, Phone Numbers
    scrubbed = scrubbed.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]");
    scrubbed = scrubbed.replace(/\+?229\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}/g, "[BENIN_PHONE]"); // Benin format

    // Custom Benin-First rules
    rules.forEach(rule => {
      const regex = new RegExp(rule.pattern, 'g');
      scrubbed = scrubbed.replace(regex, rule.replacement);
    });

    return scrubbed;
  }

  /**
   * Anonymizes a student payload for external AI processing.
   */
  static anonymizeStudent(student) {
    return {
      id_hash: this.hash(student.deviceId),
      level: student.target_level,
      city: student.city, // Geolocation allowed for regional adaptation
      school: "[SCRUBBED_FOR_SOVEREIGNTY]",
      performance_history: student.grades || []
    };
  }

  static hash(str) {
    // Simple non-reversible hash for demonstration
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }
}
