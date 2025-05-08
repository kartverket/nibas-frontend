import { IconButton, Select, Spinner } from "@kvib/react";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import { Environment, getCurrentEnvironment, NibasOrigin } from "components/FeatureToggle";
import { useMemo, useState } from "react";
import { styled } from "styled-components";
import useSWR from "swr";
import { GitHubPullRequest } from "types/github-api-types";
import { zindex } from "utils/constants";

type EnvironmentStyle = { label: string; color: string };

const getFeatureBranchName = () => {
  return window.location.hostname.split(".")[0];
};

const styles: Record<Environment, EnvironmentStyle> = {
  "dev-main": {
    label: "Utviklingsmiljø",
    color: "var(--kvib-colors-purple-200)",
  },
  prod: {
    label: "",
    color: "transparent",
  },
  "dev-e2e": {
    label: "E2E-testmiljø",
    color: "var(--kvib-colors-blue-200)",
  },
  localhost: {
    label: "Lokalt utviklingsmiljø",
    color: "var(--kvib-colors-red-200)",
  },
  "feature-branch": {
    label: getFeatureBranchName(),
    color: "var(--kvib-colors-purple-200)",
  },
};

type EnvironmentOption = { title: string; branch_url: string; author?: string };

const currentEnvironments: EnvironmentOption[] = [
  {
    title: "nibas-main",
    branch_url: NibasOrigin.DEV_MAIN,
  },
  {
    title: "localhost",
    branch_url: NibasOrigin.LOCALHOST,
  },
];

const fetchNibasRepoPRs = async (repo: string): Promise<GitHubPullRequest[]> => {
  const response = await fetch(`/repos/kartverket/${repo}/pulls`);
  const data = await response.json();
  if (response.ok) {
    return data;
  } else {
    return [];
  }
};

const mapPRtoOptionObject = (pr: GitHubPullRequest | null | undefined): EnvironmentOption | null => {
  if (pr == null) {
    return null;
  }
  return {
    title: pr.title,
    branch_url: "https://nibas-" + pr.head.ref + ".atkv3-dev.kartverket-intern.cloud",
    author: pr.user.login,
  };
};

const selectWidth = 300;

const EnvironmentOverlay = ({ children }: { children: React.ReactNode }) => {
  const env = getCurrentEnvironment();
  const { isAuthenticated } = useAuthentication();

  const envSwitchEnabeled = isAuthenticated && env !== "dev-e2e" && env !== "prod";
  const style = styles[env];
  const [environmentContainerOpen, setEnvironmentContainerOpen] = useState(false);

  const { data: nibasFrontendPRs, isLoading: isFrontendPRsLoading } = useSWR(
    envSwitchEnabeled ? "nibas-frontend" : null,
    fetchNibasRepoPRs,
  );
  const { data: nibasBackendPRs, isLoading: isBackendPRsLoading } = useSWR(
    envSwitchEnabeled ? "nibas-backend" : null,
    fetchNibasRepoPRs,
  );
  const { data: nibasEventsPRs, isLoading: isEventsPRsLoading } = useSWR(
    envSwitchEnabeled ? "nibas-events" : null,
    fetchNibasRepoPRs,
  );
  const { data: nibasArbeidslistePRs, isLoading: isArbeidslistePRsLoading } = useSWR(
    envSwitchEnabeled ? "nibas-arbeidsliste" : null,
    fetchNibasRepoPRs,
  );

  const isLoading = isFrontendPRsLoading || isBackendPRsLoading || isArbeidslistePRsLoading || isEventsPRsLoading;

  const allEnvironmentOptions = useMemo(() => {
    const allPRs = [
      ...(nibasFrontendPRs || []),
      ...(nibasBackendPRs || []),
      ...(nibasEventsPRs || []),
      ...(nibasArbeidslistePRs || []),
    ];

    return (
      currentEnvironments
        .concat(allPRs.map(mapPRtoOptionObject).filter((pr) => pr !== null))
        // Dependabot oppretter brancher med ugylidig hostname label.
        // Dette kan fikses ved å eksplisitt håndtere dette i wokflows som oppretter feature-namespaces, men det er ikke gjort per nå.
        .filter((option) => option.author !== "dependabot[bot]")
    );
  }, [nibasArbeidslistePRs, nibasBackendPRs, nibasEventsPRs, nibasFrontendPRs]);

  const onSelectEnvironment = (url: string) => {
    // bruker samme database for alle dev-miljøer, så dermed skal vi kunne gå til samme paths på tvers av miljøer i dev.
    window.location.href = url.concat(window.location.pathname);
  };

  const onToggleEnvironmentSelectContainer = () => setEnvironmentContainerOpen((prevState) => !prevState);

  return (
    <>
      {children}
      <Overlay color={style.color}>
        <OverlayLabel color={style.color}>{style.label}</OverlayLabel>
        {envSwitchEnabeled && (
          <EnvironmentSelectContainer $color={style.color} $isOpen={environmentContainerOpen}>
            {isLoading ? (
              <Spinner color="white" />
            ) : (
              <>
                <EnvironmentSelect
                  size={"sm"}
                  onChange={(e) => onSelectEnvironment(e.target.value)}
                  value={window.location.origin}
                >
                  {allEnvironmentOptions?.map((pr, i) => (
                    <option key={i} value={pr.branch_url}>
                      [{pr.title}]{pr.author != null && `- ${pr.author}`}
                    </option>
                  ))}
                </EnvironmentSelect>
                <StyledIconButton
                  $isOpen={environmentContainerOpen}
                  aria-label={"lukk miljøvelger"}
                  icon={"chevron_left"}
                  variant="ghost"
                  size={"sm"}
                  onClick={onToggleEnvironmentSelectContainer}
                />
              </>
            )}
          </EnvironmentSelectContainer>
        )}
      </Overlay>
    </>
  );
};

const EnvironmentSelectContainer = styled.div<{ $color: string; $isOpen: boolean }>`
  z-index: ${zindex.environmentOverlay};
  background-color: ${(props) => props.$color};
  position: fixed;
  bottom: 0;
  padding: 5px 5px 5px 0;
  border-top-right-radius: 8px;
  display: flex;
  align-items: center;
  column-gap: 5px;
  left: ${(props) => (!props.$isOpen ? `-${selectWidth}px` : "4px")};
  transition: left 0.5s ease-in-out;
`;

const EnvironmentSelect = styled(Select)`
  border-radius: 5px;
  background: white;
  pointer-events: auto;
  width: ${selectWidth}px;
`;

const Overlay = styled.div<{ color: string }>`
  position: fixed;
  border: 4px solid ${(props) => props.color};
  inset: 0;
  pointer-events: none;
  z-index: ${zindex.environmentOverlay};
`;

const OverlayLabel = styled.span<{ color: string }>`
  display: inline-block;
  position: relative;
  top: 50%;
  writing-mode: vertical-lr;

  transform: translateY(-50%);
  font-weight: bold;
  background: ${(props) => props.color};
  padding: 16px 8px 16px 4px;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
`;

const StyledIconButton = styled(IconButton)<{ $isOpen: boolean }>`
  pointer-events: auto;
  transition: transform 0.5s ease-in-out;
  transform: ${(props) => (!props.$isOpen ? "rotate(180deg)" : "rotate(0deg)")};
`;

export default EnvironmentOverlay;
