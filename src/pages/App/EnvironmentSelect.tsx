import { Spinner, Icon, IconButton } from "@kvib/react";
import { getCurrentEnvironment, NibasOrigin } from "components/FeatureToggle";
import { useState } from "react";
import Select, { DropdownIndicatorProps, components, StylesConfig } from "react-select";
import { styled } from "styled-components";
import useSWR from "swr";
import { GitHubPullRequest, ListJobsResponse, ListWorkflowRunsResponse } from "types/github-api-types";
import { zindex } from "utils/constants";
import { styles } from "./EnvironmentOverlay";

type EnvironmentOption = {
  label: string;
  value: string;
  author: string | null;
  profile_pic_url: string | null;
  lokasjon: string;
  date: string;
};

const currentEnvironments: EnvironmentOption[] = [
  {
    label: "Devmiljø (SKIP)",
    value: NibasOrigin.DEV_MAIN,
    author: null,
    profile_pic_url: null,
    lokasjon: "main",
    date: Date.now().toString(),
  },
  {
    label: "Lokalt utviklingsmiljø",
    value: NibasOrigin.LOCALHOST,
    author: null,
    profile_pic_url: null,
    lokasjon: "localhost",
    date: Date.now().toString(),
  },
];

const fetchNibasRepoPRs = async (repo: string): Promise<GitHubPullRequest[]> => {
  const response = await fetch(`/repos/kartverket/${repo}/pulls`);
  if (response.ok === false) {
    return [];
  }
  return await response.json();
};

const fetchDeployedPRs = async (repo: string): Promise<GitHubPullRequest[]> => {
  const PRs = await fetchNibasRepoPRs(repo);
  const deployedPRs: GitHubPullRequest[] = [];

  // Hvis vi ikke får response om deploymentstatus så dropper vi bare å vise den i selecten
  for (const pr of PRs) {
    const runsResponse = await fetch(`/repos/kartverket/${repo}/actions/runs?head_sha=${pr.head.sha}`);
    if (runsResponse.ok === false) {
      continue;
    }
    const workflowRuns: ListWorkflowRunsResponse = await runsResponse.json();
    const releasePRRun = workflowRuns.workflow_runs?.find((run) => run.name.includes("Release PR"));
    if (releasePRRun == null) {
      continue;
    }

    const jobsResponse = await fetch(`/repos/kartverket/${repo}/actions/runs/${releasePRRun.id}/jobs`);
    if (jobsResponse.ok === false) {
      continue;
    }

    const jobsList: ListJobsResponse = await jobsResponse.json();
    const isPRDeployed = jobsList.jobs.some(
      (job) => job.name.includes("Deploy Pull Request") === true && job.conclusion === "success",
    );
    if (isPRDeployed === true) {
      deployedPRs.push(pr);
    }
  }
  return deployedPRs;
};

const mapPRtoOptionObject = (pr: GitHubPullRequest): EnvironmentOption | null => {
  if (pr == null) {
    return null;
  }
  // Branchnavn blir lowercase i workflow, så vi må også gjøre det i denne koden
  return {
    label: pr.title,
    value: "https://nibas-" + pr.head.ref.toLowerCase() + ".atkv3-dev.kartverket-intern.cloud",
    author: pr.user.login,
    profile_pic_url: pr.user.avatar_url,
    lokasjon: pr.head.repo.name,
    date: pr.updated_at,
  };
};

const mapToEnvironmentSelectOption = (option: EnvironmentOption) => {
  return (
    <SelectContainer>
      <TitlesContainer>
        <TruncatedLabel>{option.label}</TruncatedLabel>
        <RepositoryLabel>{option.lokasjon}</RepositoryLabel>
      </TitlesContainer>

      {option.author != null && option.profile_pic_url != null && (
        <AuthorContainer>
          {option.author} <AuthorImage src={option.profile_pic_url} />
        </AuthorContainer>
      )}
    </SelectContainer>
  );
};

const selectWidth = 400;
const refreshButtonWidth = 32;
export const EnvironmentSelect = () => {
  const env = getCurrentEnvironment();
  const style = styles[env];
  const envSwitchEnabled = env !== "dev-e2e" && env !== "prod";
  const [environmentContainerOpen, setEnvironmentContainerOpen] = useState(false);

  const {
    data: nibasFrontendPRs,
    isLoading: isFrontendPRsLoading,
    mutate: mutateFrontendPRs,
  } = useSWR(envSwitchEnabled ? "nibas-frontend" : null, fetchDeployedPRs);
  const {
    data: nibasBackendPRs,
    isLoading: isBackendPRsLoading,
    mutate: mutateBackendPRs,
  } = useSWR(envSwitchEnabled ? "nibas-backend" : null, fetchDeployedPRs);
  const {
    data: nibasEventsPRs,
    isLoading: isEventsPRsLoading,
    mutate: mutateEventsPRs,
  } = useSWR(envSwitchEnabled ? "nibas-events" : null, fetchDeployedPRs);
  const {
    data: nibasArbeidslistePRs,
    isLoading: isArbeidslistePRsLoading,
    mutate: mutateArbeidslistePRs,
  } = useSWR(envSwitchEnabled ? "nibas-arbeidsliste" : null, fetchDeployedPRs);

  const mutateAllPRs = () => {
    mutateFrontendPRs();
    mutateBackendPRs();
    mutateEventsPRs();
    mutateArbeidslistePRs();
  };

  const isLoading = isFrontendPRsLoading || isBackendPRsLoading || isArbeidslistePRsLoading || isEventsPRsLoading;

  // Dependabot oppretter brancher med ugylidig hostname label.
  // Dette kan fikses ved å eksplisitt håndtere dette i wokflows som oppretter feature-namespaces, men det er ikke gjort per nå.
  const allEnvironmentOptions = currentEnvironments.concat(
    [
      ...(nibasFrontendPRs || []),
      ...(nibasBackendPRs || []),
      ...(nibasEventsPRs || []),
      ...(nibasArbeidslistePRs || []),
    ]
      .map(mapPRtoOptionObject)
      .filter((pr) => pr !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  );

  const onSelectEnvironment = (url: string) => {
    window.location.href = url.concat(window.location.pathname);
  };

  const CustomDropdownIndicator = (props: DropdownIndicatorProps<EnvironmentOption, false>) => {
    const { selectProps } = props;
    const isMenuOpen = selectProps.menuIsOpen;
    const placement = selectProps.menuPlacement;

    return (
      <components.DropdownIndicator {...props}>
        {placement === "top" && isMenuOpen ? <Icon icon={"arrow_downward"} /> : <Icon icon={"arrow_upward"} />}
      </components.DropdownIndicator>
    );
  };

  const onToggleEnvironmentSelectContainer = () => setEnvironmentContainerOpen((prevState) => !prevState);

  const selectedOption = allEnvironmentOptions.find((opt) => opt.value === window.location.origin);

  const customStyles: StylesConfig<EnvironmentOption> = {
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? style.color : state.isFocused ? "var(--kvib-colors-gray-200)" : "white",
      color: "black",
      cursor: "pointer",
    }),
    control: (base) => ({
      ...base,
      backgroundColor: "white",
      borderColor: "var(--kvib-colors-gray-300)",
      "&:hover": {
        borderColor: "var(--kvib-colors-gray-400)",
      },
      boxShadow: "none",
    }),
  };

  return (
    envSwitchEnabled === true && (
      <EnvironmentSelectContainer $color={style.color} $isOpen={environmentContainerOpen}>
        <>
          <StyledSelect
            components={{ DropdownIndicator: CustomDropdownIndicator, IndicatorSeparator: null }}
            styles={customStyles}
            onChange={(option) => {
              if (option) {
                onSelectEnvironment(option.value);
              }
            }}
            value={selectedOption}
            options={allEnvironmentOptions}
            menuPlacement="top"
            formatOptionLabel={mapToEnvironmentSelectOption}
          />
          <StyledIconButton
            icon={"refresh"}
            variant="ghost"
            size={"sm"}
            aria-label={"refresh miljøvelger"}
            onClick={() => mutateAllPRs()}
          />
          {isLoading ? (
            <Spinner size={"lg"} color="white" />
          ) : (
            <>
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
        </>
      </EnvironmentSelectContainer>
    )
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
  left: ${(props) => (!props.$isOpen ? `-${selectWidth + refreshButtonWidth}px` : "4px")};
  transition: left 0.5s ease-in-out;
`;

const StyledSelect = styled(Select<EnvironmentOption>)`
  border-radius: 5px;
  background: white;
  pointer-events: auto;
  width: ${selectWidth}px;
`;

const StyledIconButton = styled(IconButton)<{ $isOpen?: boolean }>`
  pointer-events: auto;
  transition: transform 0.5s ease-in-out;
  transform: ${({ $isOpen = false }) => ($isOpen ? "rotate(0deg)" : "rotate(180deg)")};
`;

const SelectContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 5px;
  padding: 5px;
`;

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const AuthorImage = styled.img`
  width: 25px;
  height: 25px;
  border-radius: 50%;
`;

const TruncatedLabel = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
`;

const TitlesContainer = styled.div`
  white-space: nowrap;
  max-width: 50%;
  display: flex;
  flex-direction: column;
`;

const RepositoryLabel = styled.span`
  font-size: 12px;
  color: var(--kvib-colors-gray-500);
  font-style: italic;
`;
