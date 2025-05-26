import { Spinner, Icon, IconButton } from "@kvib/react";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import { getCurrentEnvironment, NibasOrigin } from "components/FeatureToggle";
import { useState, useMemo } from "react";
import Select, { DropdownIndicatorProps, components, StylesConfig } from "react-select";
import { styled } from "styled-components";
import useSWR from "swr";
import { GitHubPullRequest, ListJobsResponse, ListWorkflowRunsResponse } from "types/github-api-types";
import { zindex } from "utils/constants";
import { styles } from "./EnvironmentOverlay";
import { removeNil } from "utils/list-utils";

type EnvironmentOption = {
  label: string;
  value: string;
  author?: string;
  profile_pic_url?: string;
  repository?: string;
};

const currentEnvironments: EnvironmentOption[] = [
  {
    label: "nibas-main",
    value: NibasOrigin.DEV_MAIN,
  },
  {
    label: "localhost",
    value: NibasOrigin.LOCALHOST,
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
  if (PRs.length === 0) {
    return [];
  }

  const prWorkflowPromises = PRs.map((pr) => ({
    pr,
    workflowPromise: fetch(`/repos/kartverket/${repo}/actions/runs?head_sha=${pr.head.sha}`).then((response) =>
      response.ok ? (response.json() as Promise<ListWorkflowRunsResponse>) : null,
    ),
  }));

  const prWorkflowResults = await Promise.all(
    prWorkflowPromises.map(async ({ pr, workflowPromise }) => ({
      pr,
      workflowRuns: await workflowPromise,
    })),
  );

  const prsWithReleaseRuns = prWorkflowResults
    .filter((result) => result.workflowRuns != null)
    .filter(({ workflowRuns }) => workflowRuns?.workflow_runs?.some((run) => run.name.includes("Release PR")) ?? false)
    .map(({ pr }) => pr);

  if (prsWithReleaseRuns.length === 0) {
    return [];
  }

  const prJobsPromises = prsWithReleaseRuns.map(async (pr) => {
    const prWorkflow = prWorkflowResults.find((result) => result.pr === pr);
    if (prWorkflow?.workflowRuns == null) {
      return null;
    }

    const releasePRRun = prWorkflow.workflowRuns.workflow_runs?.find((run) => run.name.includes("Release PR"));
    if (releasePRRun == null) {
      return null;
    }

    const jobsResponse = await fetch(`/repos/kartverket/${repo}/actions/runs/${releasePRRun.id}/jobs`);
    if (jobsResponse.ok === false) {
      return null;
    }
    return {
      pr,
      jobs: (await jobsResponse.json()) as ListJobsResponse,
    };
  });

  const prJobsResults = removeNil(await Promise.all(prJobsPromises));

  return prJobsResults
    .filter(({ jobs }) =>
      jobs.jobs.some((job) => job.name.includes("Deploy Pull Request") && job.conclusion === "success"),
    )
    .map(({ pr }) => pr);
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
    repository: pr.head.repo.name,
  };
};

const mapToEnvironmentSelectOption = (option: EnvironmentOption) => {
  return (
    <SelectContainer>
      <TitlesContainer>
        <TruncatedLabel>{option.label}</TruncatedLabel>
        <RepositoryLabel>{option.repository}</RepositoryLabel>
      </TitlesContainer>

      {option.author != null && (
        <AuthorContainer>
          {option.author} <AuthorImage src={option.profile_pic_url} />
        </AuthorContainer>
      )}
    </SelectContainer>
  );
};

const selectWidth = 400;
export const EnvironmentSelect = () => {
  const env = getCurrentEnvironment();
  const style = styles[env];
  const { isAuthenticated } = useAuthentication();

  const envSwitchEnabled = isAuthenticated && env !== "dev-e2e" && env !== "prod";
  const [environmentContainerOpen, setEnvironmentContainerOpen] = useState(true);

  const { data: nibasFrontendPRs, isLoading: isFrontendPRsLoading } = useSWR(
    envSwitchEnabled ? "nibas-frontend" : null,
    fetchDeployedPRs,
  );
  const { data: nibasBackendPRs, isLoading: isBackendPRsLoading } = useSWR(
    envSwitchEnabled ? "nibas-backend" : null,
    fetchDeployedPRs,
  );
  const { data: nibasEventsPRs, isLoading: isEventsPRsLoading } = useSWR(
    envSwitchEnabled ? "nibas-events" : null,
    fetchDeployedPRs,
  );
  const { data: nibasArbeidslistePRs, isLoading: isArbeidslistePRsLoading } = useSWR(
    envSwitchEnabled ? "nibas-arbeidsliste" : null,
    fetchDeployedPRs,
  );

  const isLoading = isFrontendPRsLoading || isBackendPRsLoading || isArbeidslistePRsLoading || isEventsPRsLoading;

  const allEnvironmentOptions = useMemo(() => {
    // Dependabot oppretter brancher med ugylidig hostname label.
    // Dette kan fikses ved å eksplisitt håndtere dette i wokflows som oppretter feature-namespaces, men det er ikke gjort per nå.
    const allPRs = [
      ...(nibasFrontendPRs || []),
      ...(nibasBackendPRs || []),
      ...(nibasEventsPRs || []),
      ...(nibasArbeidslistePRs || []),
    ];

    return currentEnvironments.concat(allPRs.map(mapPRtoOptionObject).filter((pr) => pr !== null));
  }, [nibasArbeidslistePRs, nibasBackendPRs, nibasEventsPRs, nibasFrontendPRs]);

  const onSelectEnvironment = (url: string) => {
    // bruker samme database for alle dev-miljøer, så dermed skal vi kunne gå til samme paths på tvers av miljøer i dev.
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
        {isLoading ? (
          <Spinner size={"lg"} color="white" />
        ) : (
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
  left: ${(props) => (!props.$isOpen ? `-${selectWidth}px` : "4px")};
  transition: left 0.5s ease-in-out;
`;

const StyledSelect = styled(Select<EnvironmentOption>)`
  border-radius: 5px;
  background: white;
  pointer-events: auto;
  width: ${selectWidth}px;
`;

const StyledIconButton = styled(IconButton)<{ $isOpen: boolean }>`
  pointer-events: auto;
  transition: transform 0.5s ease-in-out;
  transform: ${(props) => (!props.$isOpen ? "rotate(180deg)" : "rotate(0deg)")};
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
