import { runUserRepositoryContractTests, InMemoryUserRepository } from "@livingsites/test-support";

runUserRepositoryContractTests("InMemoryUserRepository", () => {
  const repo = new InMemoryUserRepository();
  return {
    reader: repo,
    creator: repo,
    cleanup: async () => { repo.clear(); },
  };
});
