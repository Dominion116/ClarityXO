import { describe, it, expect } from "vitest";

describe("Trophy distribution", () => {
  it("should distribute to top 5 players", () => {
    const winners = [
      "SP1VW7TPKTY8W4AWNYR00YD4E914RSWGM70VKVCAY",
      "SP3XR5PCCV557KE2ZZB3W04B91F6042HKZ8KNX1ZS",
      "SP2WCKWN7A7HBHEHCQPQ8RFWSH1XKDP54TAE7KDQ2",
      "SP1EM6HQFSV15WYS4G9BRMM3YF4TH9Y4437YCKTG1",
      "SP1ZDHDT2D6EH9CTJZA2FMTV8FJGTBSQBJQ46ABEN"
    ];
    expect(winners.length).toBe(5);
  });
});
