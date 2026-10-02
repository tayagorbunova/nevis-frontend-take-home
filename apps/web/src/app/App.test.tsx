import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { failNextRequest } from "../test/server";

import { App } from "./App";

function waitForTable() {
  return screen.findByRole("treegrid", { name: "Client counts per month" });
}

function monthNames() {
  const columnNames = screen.getAllByRole("columnheader").map((header) => header.textContent);

  return columnNames.filter((columnName) => columnName !== "Name");
}

function countsIn(rowName: string) {
  const row = screen.getByRole("row", { name: rowName });
  const cells = within(row).getAllByRole("gridcell");

  return cells.map((cell) => cell.textContent);
}

function chartCaption() {
  return screen.getByRole("figure").querySelector("figcaption")?.textContent;
}

function focusRow(rowName: string) {
  act(() => screen.getByRole("row", { name: rowName }).focus());
}

async function choosePeriod(user: UserEvent, periodName: string) {
  await user.click(screen.getByRole("button", { name: /Period/ }));
  await user.click(screen.getByRole("option", { name: periodName }));
}

describe("the Clients page", () => {
  it("shows the real numbers, follows the opened row and changes the period", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitForTable();
    expect(monthNames()[0]).toBe("Feb 2024");
    expect(countsIn("Company")[0]).toBe("250");
    expect(chartCaption()).toBe("Company by branch");

    await user.click(screen.getByRole("row", { name: "Branch 1" }));
    expect(chartCaption()).toBe("Branch 1 by advisor");

    await choosePeriod(user, "Last 3 months");
    await waitFor(() => expect(monthNames()).toEqual(["Nov 2024", "Dec 2024", "Jan 2025"]));
    expect(countsIn("Company")).toEqual(["250", "250", "350"]);
  });

  it("opens and closes a row with the arrow keys, and the chart follows", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitForTable();
    focusRow("Branch 1");

    await user.keyboard("{ArrowRight}");
    expect(chartCaption()).toBe("Branch 1 by advisor");

    await user.keyboard("{ArrowLeft}");
    expect(chartCaption()).toBe("Company by branch");
  });

  it("lets the person try again when the server fails", async () => {
    const user = userEvent.setup();
    failNextRequest();
    render(<App />);

    await screen.findByText("Couldn't load clients");
    await user.click(screen.getByRole("button", { name: "Try again" }));

    await waitForTable();
    expect(monthNames()[0]).toBe("Feb 2024");
    expect(countsIn("Company")[0]).toBe("250");
    expect(screen.queryByText("Couldn't load clients")).toBeNull();
  });

  it("shows the error, not the numbers it already had, when a period fails to reload", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitForTable();
    await choosePeriod(user, "Last 3 months");
    await waitFor(() => expect(monthNames()).toEqual(["Nov 2024", "Dec 2024", "Jan 2025"]));

    failNextRequest();
    await choosePeriod(user, "Last 12 months");

    await screen.findByText("Couldn't load clients");
    expect(screen.queryByRole("treegrid")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    await waitForTable();
    expect(monthNames()[0]).toBe("Feb 2024");
  });
});
