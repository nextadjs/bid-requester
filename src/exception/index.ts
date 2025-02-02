export class InvalidBidRequestException extends Error {
  name = "InvalidBidRequestException";

  public constructor(message?: string) {
    super(
      `Invalid bid request: ${
        message || "required parameters are missing or malformed."
      }`
    );
  }
}

export class NoBidResponseException extends Error {
  name = "NoBidResponseException";
  message = "No bid response received from the auction.";
}

export class UnexpectedError extends Error {}
