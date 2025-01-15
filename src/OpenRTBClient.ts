import {
  InvalidBidRequestException,
  NoBidResponseException,
  UnexpectedError,
} from "./exception";

type Settings = {
  endpoint: string;
  dataFormat?: string;
  acceptEncoding?: string;
  contentEncoding?: string;
  cacheControl?: string;
  version: string;
  customHeaders?: Record<string, string>;
};

export class OpenRTBClient {
  private endpoint: string;
  private dataFormat: string;
  private acceptEncoding: string;
  private contentEncoding: string;
  private cacheControl: string;
  private version: string;
  private customHeaders?: Record<string, string>;

  public constructor(settings: Settings) {
    this.endpoint = settings.endpoint;
    this.dataFormat = settings.dataFormat || "application/json";
    this.acceptEncoding = settings.acceptEncoding || "gzip";
    this.contentEncoding = settings.contentEncoding || "gzip";
    this.cacheControl = settings.cacheControl || "no-store";
    this.version = settings.version;
    this.customHeaders = settings.customHeaders;
  }

  public async request<Req, Res>(bidRequest: Req): Promise<Res> {
    try {
      const httpResponse = await fetch(this.endpoint, {
        method: "POST",
        body: JSON.stringify(bidRequest),
        headers: {
          ...this.customHeaders,
          "Content-Type": this.dataFormat,
          "Accept-Encoding": this.acceptEncoding,
          "Content-Encoding": this.contentEncoding,
          "x-openrtb-version": this.version,
          "Cache-Control": this.cacheControl,
        },
      });

      if (httpResponse.status === 200) {
        return httpResponse.json() as Res;
      } else if (httpResponse.status === 204) {
        throw new NoBidResponseException();
      } else if (httpResponse.status === 400) {
        throw new InvalidBidRequestException();
      } else {
        throw new UnexpectedError(
          `Unexpected HTTP response: received status code ${httpResponse.status}`
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new UnexpectedError("Unexpected error");
      }
    }
  }
}
