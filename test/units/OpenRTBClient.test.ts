import {
  InvalidBidRequestException,
  NoBidResponseException,
  UnexpectedError,
} from "@/exception";
import { OpenRTBClient } from "@/OpenRTBClient";
import { openrtbFaker } from "@nextad/faker";
import type { BidRequest, BidResponse } from "iab-openrtb/v26";

describe("OpenRTB Client", () => {
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("When request", () => {
    it("sends request to specified endpoint", () => {
      fetchMock.mockImplementation(
        async () => new Response("{}", { status: 200 })
      );
      const sut = new OpenRTBClient({
        endpoint: "https://example.com/endpoint",
        version: "2.6",
      });
      const bidRequest = openrtbFaker.v26.bidRequest.web().addImp().make();

      sut.request<BidRequest, BidResponse>(bidRequest);

      expect(fetchMock).toHaveBeenCalledWith(
        "https://example.com/endpoint",
        expect.any(Object)
      );
    });

    it("sends request with specified openrtb version", () => {
      fetchMock.mockImplementation(
        async () => new Response("{}", { status: 200 })
      );
      const sut = new OpenRTBClient({
        endpoint: "https://example.com/endpoint",
        version: "3.0",
      });
      const bidRequest = openrtbFaker.v26.bidRequest.web().addImp().make();

      sut.request<BidRequest, BidResponse>(bidRequest);

      expect(fetchMock).toHaveBeenCalledWith(
        "https://example.com/endpoint",
        expect.objectContaining({
          headers: expect.objectContaining({
            "x-openrtb-version": "3.0",
          }),
        })
      );
    });

    it("Credentials is `include` when `withCredentials` is specified as true", () => {
      fetchMock.mockImplementation(
        async () => new Response("{}", { status: 200 })
      );
      const sut = new OpenRTBClient({
        endpoint: "https://example.com/endpoint",
        version: "3.0",
        withCredentials: true,
      });
      const bidRequest = openrtbFaker.v26.bidRequest.web().addImp().make();

      sut.request<BidRequest, BidResponse>(bidRequest);

      expect(fetchMock).toHaveBeenCalledWith(
        "https://example.com/endpoint",
        expect.objectContaining({
          credentials: "include",
        })
      );
    });

    it("Credentials is `omit` when `withCredentials` is specified as false", () => {
      fetchMock.mockImplementation(
        async () => new Response("{}", { status: 200 })
      );
      const sut = new OpenRTBClient({
        endpoint: "https://example.com/endpoint",
        version: "3.0",
        withCredentials: false,
      });
      const bidRequest = openrtbFaker.v26.bidRequest.web().addImp().make();

      sut.request<BidRequest, BidResponse>(bidRequest);

      expect(fetchMock).toHaveBeenCalledWith(
        "https://example.com/endpoint",
        expect.not.objectContaining({
          credentials: "include",
        })
      );
    });

    it.each([
      {
        key: "dataFormat",
        value: "text/html; charset=utf-8",
        expectedHeaderKey: "Content-Type",
        expectedHeaderValue: "text/html; charset=utf-8",
      },
      {
        key: "acceptEncoding",
        value: "compress",
        expectedHeaderKey: "Accept-Encoding",
        expectedHeaderValue: "compress",
      },
      {
        key: "contentEncoding",
        value: "compress",
        expectedHeaderKey: "Content-Encoding",
        expectedHeaderValue: "compress",
      },
      {
        key: "cacheControl",
        value: "no-cache",
        expectedHeaderKey: "Cache-Control",
        expectedHeaderValue: "no-cache",
      },
      {
        key: "customHeaders",
        value: { "x-auth": "123" },
        expectedHeaderKey: "x-auth",
        expectedHeaderValue: "123",
      },
    ])(
      "sends request with specified $key",
      ({ key, value, expectedHeaderKey, expectedHeaderValue }) => {
        fetchMock.mockImplementation(
          async () => new Response("{}", { status: 200 })
        );
        const sut = new OpenRTBClient({
          endpoint: "",
          version: "2.6",
          [key]: value,
        });
        const bidRequest = openrtbFaker.v26.bidRequest.web().addImp().make();

        sut.request<BidRequest, BidResponse>(bidRequest);

        const defaultExpectedHeaders = {
          "Accept-Encoding": "gzip",
          "Cache-Control": "no-store",
          "Content-Encoding": "*",
          "Content-Type": "application/json",
          "x-openrtb-version": "2.6",
        };
        expect(fetchMock).toHaveBeenCalledWith(
          "",
          expect.objectContaining({
            headers: expect.objectContaining({
              ...defaultExpectedHeaders,
              [expectedHeaderKey]: expectedHeaderValue,
            }),
          })
        );
      }
    );

    it.each([
      {
        key: "dataFormat",
        defaultValue: "application/json",
        expectedHeaderKey: "Content-Type",
      },
      {
        key: "acceptEncoding",
        defaultValue: "gzip",
        expectedHeaderKey: "Accept-Encoding",
      },
      {
        key: "contentEncoding",
        defaultValue: "gzip",
        expectedHeaderKey: "Content-Encoding",
      },
      {
        key: "cacheControl",
        defaultValue: "no-store",
        expectedHeaderKey: "Cache-Control",
      },
    ])(
      "sends request to default value when $key is not specified",
      ({ key, expectedHeaderKey, defaultValue }) => {
        fetchMock.mockImplementation(
          async () => new Response("{}", { status: 200 })
        );
        const sut = new OpenRTBClient({
          endpoint: "",
          version: "2.6",
          [key]: defaultValue,
        });
        const bidRequest = openrtbFaker.v26.bidRequest.web().addImp().make();

        sut.request<BidRequest, BidResponse>(bidRequest);

        const defaultExpectedHeaders = {
          "Accept-Encoding": "gzip",
          "Cache-Control": "no-store",
          "Content-Encoding": "*",
          "Content-Type": "application/json",
          "x-openrtb-version": "2.6",
        };
        expect(fetchMock).toHaveBeenCalledWith(
          "",
          expect.objectContaining({
            headers: expect.objectContaining({
              ...defaultExpectedHeaders,
              [expectedHeaderKey]: defaultValue,
            }),
          })
        );
      }
    );
  });

  describe("When response", () => {
    it("returns bid response as json when response succeeds", async () => {
      fetchMock.mockImplementation(
        async () => new Response('{"id": "1"}', { status: 200 })
      );
      const sut = new OpenRTBClient({
        endpoint: "https://example.com/endpoint",
        version: "2.6",
      });
      const bidRequest = openrtbFaker.v26.bidRequest.web().addImp().make();

      const response = await sut.request<BidRequest, BidResponse>(bidRequest);

      expect(response.id).toBe("1");
    });

    it.each([
      {
        name: "NoContent",
        status: 204,
        response: null,
        expectedThrow: NoBidResponseException,
      },
      {
        name: "BadRequest",
        status: 400,
        response: "{}",
        expectedThrow: InvalidBidRequestException,
      },
      {
        name: "Unexpected",
        status: 500,
        response: null,
        expectedThrow: UnexpectedError,
      },
    ])(
      "throws $expectedThrow when response is $name",
      async ({ status, expectedThrow, response }) => {
        fetchMock.mockImplementation(
          async () => new Response(response, { status: status })
        );
        const sut = new OpenRTBClient({
          endpoint: "https://example.com/endpoint",
          version: "2.6",
        });
        const bidRequest = openrtbFaker.v26.bidRequest.web().addImp().make();

        await expect(() =>
          sut.request<BidRequest, BidResponse>(bidRequest)
        ).rejects.toThrow(expectedThrow);
      }
    );
  });
});
