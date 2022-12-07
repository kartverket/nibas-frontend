import { render, screen } from "test/test-utils";
import Landing from "./Landing";

let mockIsAuthenticated = false;
let mockErrorStatusCode: number | null = null;

jest.mock("@kartverket/frontend-aut-lib", () => {
  return {
    useAuthenticationFlow: jest.fn(() => ({
      tokenHolderFunc: jest.fn(),
      isAuthenticatedFunc: jest.fn(() => mockIsAuthenticated),
    })),
  };
});

jest.mock("hooks/useNibasApi", () =>
  jest.fn(() => ({
    data: mockErrorStatusCode == null ? {} : null,
    error: mockErrorStatusCode == null ? null : { status: mockErrorStatusCode },
    mutate: jest.fn(),
  }))
);

describe("Landing", () => {
  it("should render normally is not authenticated", async () => {
    mockIsAuthenticated = false;
    mockErrorStatusCode = null;

    render(<Landing />);

    expect(
      await screen.findByText("auth.Logg inn i Nasjonal inndelingsbase")
    ).toBeInTheDocument();
    expect(
      await screen.queryByText("auth.feil.generellFeilTittel")
    ).not.toBeInTheDocument();
    expect(
      await screen.queryByText("auth.feil.ikkeAutorisertTittel")
    ).not.toBeInTheDocument();
  });

  it("should give error if authenticated but not authorized", async () => {
    mockIsAuthenticated = true;
    mockErrorStatusCode = 403;

    render(<Landing />);

    expect(
      await screen.findByText("auth.feil.ikkeAutorisertTittel")
    ).toBeInTheDocument();
  });

  it("should give error if autenticated but autorization-check fails", async () => {
    mockIsAuthenticated = true;
    mockErrorStatusCode = 500;

    render(<Landing />);

    expect(
      await screen.findByText("auth.feil.generellFeilTittel")
    ).toBeInTheDocument();
  });
});
