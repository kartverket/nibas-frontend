import { render, screen } from "test/test-utils";
import Authentication from "./Authentication";

let mockIsAuthenticated = false;
let mockErrorStatusCode: number | null = null;

vi.mock("@kartverket/frontend-aut-lib", () => {
  return {
    useAuthenticationFlow: vi.fn(() => ({
      tokenHolderFunc: vi.fn(),
      isAuthenticatedFunc: vi.fn(() => mockIsAuthenticated),
    })),
  };
});

vi.mock("hooks/useNibasApi", () => ({
  default: vi.fn(() => ({
    data: mockErrorStatusCode == null ? {} : null,
    error: mockErrorStatusCode == null ? null : { status: mockErrorStatusCode },
    mutate: vi.fn(),
  })),
}));

describe("Authentication", () => {
  it("should render normally is not authenticated", async () => {
    mockIsAuthenticated = false;
    mockErrorStatusCode = null;

    render(<Authentication />);

    expect(
      await screen.findByText("Logg inn i Nasjonal inndelingsbase")
    ).toBeInTheDocument();
    expect(
      await screen.queryByText("En feil skjedde ved pålogging.")
    ).not.toBeInTheDocument();
    expect(
      await screen.queryByText("Du har ikke tilgang til å se inndelingsbasen.")
    ).not.toBeInTheDocument();
  });

  it("should give error if authenticated but not authorized", async () => {
    mockIsAuthenticated = true;
    mockErrorStatusCode = 403;

    render(<Authentication />);

    expect(
      await screen.findByText("Du har ikke tilgang til å se inndelingsbasen.")
    ).toBeInTheDocument();
  });

  it("should give error if autenticated but autorization-check fails", async () => {
    mockIsAuthenticated = true;
    mockErrorStatusCode = 500;

    render(<Authentication />);

    expect(
      await screen.findByText("En feil skjedde ved pålogging.")
    ).toBeInTheDocument();
  });
});
