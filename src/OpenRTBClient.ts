import {
  InvalidBidRequestException,
  NoBidResponseException,
  UnexpectedError,
} from "./exception";

type Settings = {
  endpoint: string;
  version: string;
  dataFormat?: string;
  acceptEncoding?: string;
  contentEncoding?: string;
  cacheControl?: string;
  customHeaders?: Record<string, string>;
  withCredentials?: boolean;
};

export class OpenRTBClient {
  private endpoint: string;
  private dataFormat: string;
  private acceptEncoding: string;
  private contentEncoding: string;
  private cacheControl: string;
  private version: string;
  private customHeaders?: Record<string, string>;
  private withCredentials: boolean;

  public constructor(settings: Settings) {
    this.endpoint = settings.endpoint;
    this.dataFormat = settings.dataFormat || "application/json";
    this.acceptEncoding = settings.acceptEncoding || "gzip";
    this.contentEncoding = settings.contentEncoding || "*";
    this.cacheControl = settings.cacheControl || "no-store";
    this.version = settings.version;
    this.customHeaders = settings.customHeaders;
    this.withCredentials = settings.withCredentials === true ? true : false;
  }

  public async request<Req, Res>(bidRequest: Req): Promise<Res> {
    try {
      let init: any = {
        method: "POST",
        body: JSON.stringify(bidRequest),
        cache: this.cacheControl,
        headers: {
          ...this.customHeaders,
          "Content-Type": this.dataFormat,
          "Accept-Encoding": this.acceptEncoding,
          "Content-Encoding": this.contentEncoding,
          "x-openrtb-version": this.version,
        },
      }; 

      if (this.withCredentials) {
        init.credentials = 'include'
      }

      const httpResponse = await fetch(this.endpoint, init);

      if (httpResponse.status === 200) {
        return httpResponse.json() as Res;
      } else if (httpResponse.status === 204) {
        throw new NoBidResponseException();
      } else if (httpResponse.status === 400) {
        throw new InvalidBidRequestException(await httpResponse.text());
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
