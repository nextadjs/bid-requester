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
    bidRequest: BidRequestV25,
    options?: BidRequesterOptions
  ): Promise<BidResponseV25>;
  requestV26(
    endpoint: string,
    bidRequest: BidRequestV26,
    options?: BidRequesterOptions
  ): Promise<BidResponseV26>;
  requestV30(endpoint: string, openrtb: Openrtb, options?: BidRequesterOptions): Promise<Openrtb>;
}

export type BidRequesterOptions = {
  dataFormat?: string;
  acceptEncoding?: string;
  contentEncoding?: string;
  customHeaders?: Record<string, string>;
};

export class BidRequester implements IBidRequester {
  private options: BidRequesterOptions;

  public constructor(options: BidRequesterOptions = {}) {
    this.options = options;
  }

  public async requestV25(
    endpoint: string,
    bidRequest: BidRequestV25,
    options?: BidRequesterOptions
  ): Promise<BidResponseV25> {
    options = {
      ...this.options,
      ...options,
    };

    const openrtbClient = new OpenRTBClient({
      version: "2.5",
      endpoint: endpoint,
      dataFormat: options.dataFormat,
      acceptEncoding: options.acceptEncoding,
      contentEncoding: options.contentEncoding,
      customHeaders: options.customHeaders,
    });

    return openrtbClient.request<BidRequestV25, BidResponseV25>(bidRequest);
  }

  public async requestV26(
    endpoint: string,
    bidRequest: BidRequestV26,
    options?: BidRequesterOptions
  ): Promise<BidResponseV26> {
    options = {
      ...this.options,
      ...options,
    };

    const openrtbClient = new OpenRTBClient({
      version: "2.6",
      endpoint: endpoint,
      dataFormat: options.dataFormat,
      acceptEncoding: options.acceptEncoding,
      contentEncoding: options.contentEncoding,
      customHeaders: options.customHeaders,
    });

    return openrtbClient.request<BidRequestV26, BidResponseV26>(bidRequest);
  }

  public async requestV30(
    endpoint: string,
    openrtb: Openrtb,
    options?: BidRequesterOptions
  ): Promise<Openrtb> {
    options = {
      ...this.options,
      ...options,
    };

    const openrtbClient = new OpenRTBClient({
      version: "3.0",
      endpoint: endpoint,
      dataFormat: options.dataFormat,
      acceptEncoding: options.acceptEncoding,
      contentEncoding: options.contentEncoding,
      customHeaders: options.customHeaders,
    });

    return openrtbClient.request<Openrtb, Openrtb>(openrtb);
  }
}

export * from '@/exception';
export const bidRequester = new BidRequester();