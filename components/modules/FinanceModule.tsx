"use client";

import { GovernanceModule } from "./GovernanceModule";
import type { ClubWorkspace } from "../../lib/useClubWorkspace";

export function FinanceModule({ workspace }: { workspace: ClubWorkspace }) {
  return <GovernanceModule workspace={workspace} mode="finance" />;
}
