import {
  InvalidBidRequestException,
  NoBidResponseException,
  UnexpectedError,
} from "@/exception";
import { OpenRTBClient } from "@/OpenRTBClient";
import { openrtbFaker } from "@nextad/faker";
import type { BidRequest, BidResponse } from "iab-openrtb/v26";

describe("OpenRTB Client Behavior", () => {
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("リクエスト", () => {
    it("指定したエンドポイントにリクエストが送信される", () => {
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

    it("指定したOpenRTBバージョンでリクエストが送信される", () => {
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
        expect.objectContaining({
          credentials: "omit",
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
      "$keyを指定した場合、指定した$keyでリクエストが送信される",
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
          "Content-Encoding": "gzip",
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
      "$keyを指定しない場合、$defaultValueでリクエストが送信される",
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
          "Content-Encoding": "gzip",
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

  describe("レスポンス", () => {
    it("レスポンスが成功の場合、入札レスポンスがjsonで返される", async () => {
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
      "レスポンスが$nameの場合、$expectedThrowが発生する",
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
