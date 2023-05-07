import renderer from "react-test-renderer";
import React, { useState, useEffect } from "react";
import { Chart } from "primereact/chart";
import PollChart from "../../components/pollCentre/PollChart";

jest.mock("primereact/chart");

const renderTree = (tree) => renderer.create(tree);
describe("<PollChart>", () => {
  it("should render the Poll Chart", () => {
    expect(renderTree(<PollChart />).toJSON()).toMatchSnapshot();
  });
});
