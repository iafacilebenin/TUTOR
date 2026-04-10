/**
 * TELECOM GATEWAY: USSD/SMS ADAPTER
 * Enabling intelligent tutoring for feature phones (Masses Scale).
 */

export class TelecomGateway {
  /**
   * Parses incoming USSD strings from telecom providers (MTN/Moov).
   * Format: *XXX*ID*ACTION*DATA#
   */
  static parseUSSD(input) {
    // Remove trailing # and split by *
    // e.g., "*123*456*1#" -> ["", "123", "456", "1"]
    const parts = input.replace(/#$/, '').split('*').filter(p => p !== '');
    return {
      serviceCode: parts[0],
      studentId: parts[1],
      action: parts[2] || 'MENU',
      data: parts.slice(3).join(' ')
    };
  }

  /**
   * Formats the response for USSD display (Strict character limits).
   */
  static formatResponse(message, type = 'CON') {
    // CON: Continue session, END: Terminate session
    const prefix = type === 'CON' ? 'CON ' : 'END ';
    return `${prefix}${message.substring(0, 160)}`;
  }

  /**
   * Handles the 'Universal AI Mentorship' over SMS/USSD.
   */
  static async handleRequest(request, env) {
    const { studentId, action, data } = this.parseUSSD(request.text);

    switch (action) {
      case 'GRADE':
        return this.formatResponse("Maître Étude: Entrez votre réponse pour l'exercice 102.");
      case 'SCORE':
        // Logic to fetch score from D1
        return this.formatResponse("Votre dernière note est 14.5/20. Bien joué!");
      default:
        return this.formatResponse("Bienvenue sur Maître Étude.\n1. Mes Notes\n2. Exercice du Jour\n3. Parler au Mentor");
    }
  }
}
