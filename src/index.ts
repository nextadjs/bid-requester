import type {
  BidRequest as BidRequestV25,
  BidResponse as BidResponseV25,
} from "iab-openrtb/v25";
import type {
  BidRequest as BidRequestV26,
  BidResponse as BidResponseV26,
} from "iab-openrtb/v26";
import type { Openrtb } from "iab-openrtb/v30";
import { OpenRTBClient } from "./OpenRTBClient";

export interface IBidRequester {
  requestV25(
    endpoint: string,
    bidRequest: BidRequestV25
  ): Promise<BidResponseV25>;
  requestV26(
    endpoint: string,
    bidRequest: BidRequestV26
  ): Promise<BidResponseV26>;
  requestV30(endpoint: string, openrtb: Openrtb): Promise<Openrtb>;
}

export type BidRequesterOptions = {
  dataFormat?: string;
  acceptEncoding?: string;
  contentEncoding?: string;
  customHeaders: Record<string, string>;
};

export class BidRequester implements IBidRequester {
  private options: BidRequesterOptions;

  public constructor(options: BidRequesterOptions) {
    this.options = options;
  }

  public async requestV25(
    endpoint: string,
    bidRequest: BidRequestV25
  ): Promise<BidResponseV25> {
    const openrtbClient = new OpenRTBClient({
      version: "2.5",
      endpoint: endpoint,
      dataFormat: this.options.dataFormat,
      acceptEncoding: this.options.acceptEncoding,
      contentEncoding: this.options.contentEncoding,
      customHeaders: this.options.customHeaders,
    });

    return openrtbClient.request<BidRequestV25, BidResponseV25>(bidRequest);
  }

  public async requestV26(
    endpoint: string,
    bidRequest: BidRequestV26
  ): Promise<BidResponseV26> {
    const openrtbClient = new OpenRTBClient({
      version: "2.6",
      endpoint: endpoint,
      dataFormat: this.options.dataFormat,
      acceptEncoding: this.options.acceptEncoding,
      contentEncoding: this.options.contentEncoding,
      customHeaders: this.options.customHeaders,
    });

    return openrtbClient.request<BidRequestV26, BidResponseV26>(bidRequest);
  }

  public async requestV30(
    endpoint: string,
    openrtb: Openrtb
  ): Promise<Openrtb> {
    const openrtbClient = new OpenRTBClient({
      version: "3.0",
      endpoint: endpoint,
      dataFormat: this.options.dataFormat,
      acceptEncoding: this.options.acceptEncoding,
      contentEncoding: this.options.contentEncoding,
      customHeaders: this.options.customHeaders,
    });

    return openrtbClient.request<Openrtb, Openrtb>(openrtb);
  }
}

export * from '@/exception';