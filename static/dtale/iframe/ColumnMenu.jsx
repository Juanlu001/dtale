import $ from "jquery";
import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";

import ConditionalRender from "../../ConditionalRender";
import { openChart } from "../../actions/charts";
import { buildURLString } from "../../actions/url-utils";

import { fullPath, lockCols, moveToFront, open, shouldOpenPopup, unlockCols, updateSort } from "../dataViewerMenuUtils";

import { isStringCol, SORT_PROPS } from "../gridUtils";

require("./ColumnMenu.css");

class ReactColumnMenu extends React.Component {
  componentDidUpdate(prevProps) {
    if (!_.isNull(this.props.selectedCol) && this.props.selectedCol !== prevProps.selectedCol) {
      $(this._div).css({
        left: $(`div.${this.props.selectedToggle}`).offset().left,
      });
    }
  }

  render() {
    const { dataId, selectedCol, openChart } = this.props;
    if (!selectedCol) {
      return null;
    }
    const colCfg = _.find(this.props.columns, { name: selectedCol }) || {};
    const unlocked = _.get(colCfg, "locked", false) == false;
    let currDir = _.find(this.props.sortInfo, ([col, _dir]) => selectedCol === col);
    currDir = _.isUndefined(currDir) ? SORT_PROPS[2].dir : currDir[1];
    const openPopup = (type, height = 450, width = 500) => () => {
      if (shouldOpenPopup(height, width)) {
        open(
          buildURLString(fullPath(`/dtale/popup/${type}`, dataId), {
            col: selectedCol,
          }),
          null,
          height,
          width
        );
      } else {
        openChart(_.assignIn({ type, title: _.capitalize(type) }, { col: selectedCol }));
      }
    };
    const openFormatting = () =>
      this.props.propagateState({
        formattingOpen: true,
        selectedCols: [selectedCol],
      });
    return (
      <div
        id="column-menu-div"
        className="column-toggle__dropdown"
        hidden={!this.props.columnMenuOpen}
        style={{
          minWidth: "11em",
          top: this.props.noInfo ? "1.25em" : "2.75em",
        }}
        ref={cm => (this._div = cm)}>
        <header>{`Column "${selectedCol}"`}</header>
        <ul>
          <li>
            <span className="toggler-action">
              <i className="fa fa-sort ml-4 mr-4" />
            </span>
            <div className="btn-group compact pl-3 font-weight-bold column-sorting">
              {_.map(SORT_PROPS, ({ dir, col }) => {
                const active = dir === currDir;
                return (
                  <button
                    key={dir}
                    style={active ? {} : { color: "#565b68" }}
                    className={`btn btn-primary ${active ? "active" : ""} font-weight-bold`}
                    onClick={active ? _.noop : () => updateSort([selectedCol], dir, this.props)}
                    disabled={active}>
                    {col.label}
                  </button>
                );
              })}
            </div>
          </li>
          <li>
            <span className="toggler-action">
              <button className="btn btn-plain" onClick={moveToFront([selectedCol], this.props)}>
                <i className="fa fa-caret-left ml-4 mr-4" />
                <span className="ml-3 font-weight-bold">Move To Front</span>
              </button>
            </span>
          </li>
          <ConditionalRender display={unlocked}>
            <li>
              <span className="toggler-action">
                <button className="btn btn-plain" onClick={lockCols([selectedCol], this.props)}>
                  <i className="fa fa-lock ml-3 mr-4" />
                  <span className="font-weight-bold">Lock</span>
                </button>
              </span>
            </li>
          </ConditionalRender>
          <ConditionalRender display={!unlocked}>
            <li>
              <span className="toggler-action">
                <button className="btn btn-plain" onClick={unlockCols([selectedCol], this.props)}>
                  <i className="fa fa-lock-open ml-2 mr-4" />
                  <span className="font-weight-bold">Unlock</span>
                </button>
              </span>
            </li>
          </ConditionalRender>
          <li>
            <span className="toggler-action">
              <button className="btn btn-plain" onClick={openPopup("describe", 670, 1100)}>
                <i className="ico-view-column" />
                <span className="font-weight-bold">Describe</span>
              </button>
            </span>
          </li>
          <ConditionalRender display={!isStringCol(_.get(colCfg, "dtype", ""))}>
            <li>
              <span className="toggler-action">
                <button className="btn btn-plain" onClick={openPopup("histogram", 425, 400)}>
                  <i className="ico-equalizer" />
                  <span className="font-weight-bold">Histogram</span>
                </button>
              </span>
            </li>
          </ConditionalRender>
          <li>
            <span className="toggler-action">
              <button className="btn btn-plain" onClick={openFormatting}>
                <i className="ico-palette" />
                <span className="font-weight-bold">Formats</span>
              </button>
            </span>
          </li>
        </ul>
      </div>
    );
  }
}
ReactColumnMenu.displayName = "ReactColumnMenu";
ReactColumnMenu.propTypes = {
  selectedCol: PropTypes.string,
  selectedToggle: PropTypes.string,
  columns: PropTypes.array,
  columnMenuOpen: PropTypes.bool,
  sortInfo: PropTypes.array,
  propagateState: PropTypes.func,
  dataId: PropTypes.string.isRequired,
  noInfo: PropTypes.bool,
  openChart: PropTypes.func,
};

const ReduxColumnMenu = connect(
  state => _.pick(state, ["dataId", "columnMenuOpen", "selectedCol", "selectedToggle"]),
  dispatch => ({ openChart: chartProps => dispatch(openChart(chartProps)) })
)(ReactColumnMenu);

export { ReduxColumnMenu as ColumnMenu, ReactColumnMenu };
