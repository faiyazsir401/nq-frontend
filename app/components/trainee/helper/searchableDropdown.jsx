import { useEffect, useRef, useState } from "react";
import { Search } from "react-feather";
import { Utils } from "../../../../utils/utils";
import { useAppSelector } from "../../../store";
import { authState } from "../../auth/auth.slice";

const SearchableDropdown = ({
  options,
  label,
  id,
  selectedVal,
  placeholder,
  handleChange,
  customClasses,
  selectedOption,
  searchValue,
  onSearchClick,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const { onlineUsers } = useAppSelector(authState);
  useEffect(() => {
    document.addEventListener("click", toggle);
    return () => document.removeEventListener("click", toggle);
  }, []);

  const selectOption = (option) => {
    handleChange(option[label]);
    setIsOpen((isOpen) => !isOpen);
  };

  function toggle(e) {
    setIsOpen(e && e.target === inputRef.current);
  }

  const getDisplayValue = () => {
    if (query) return query;
    if (selectedVal) return selectedVal;

    return "";
  };

  const filter = (options) => {
    const result = options.filter(
      (option) => option[label]?.toLowerCase().indexOf(query.toLowerCase()) > -1
    );
    return result;
  };
  console.log(onlineUsers, "onlineUsers");
  return (
    <div className={`dropdown ${customClasses.dropdown}`}>
      <div className="row item-center">
        <div className="col-10 p-0 m-0">
          <div className="control">
            <div className="selected-value">
              <input
                placeholder={placeholder}
                className={customClasses.searchBar}
                ref={inputRef}
                type="text"
                value={getDisplayValue()}
                name="searchTerm"
                onChange={(e) => {
                  setQuery(e.target.value);
                  handleChange(null);
                  searchValue(e.target.value);
                }}
                onClick={toggle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSearchClick(query);
                  }
                }}
              />
            </div>
            {/* <div className={`arrow ${isOpen ? 'open' : ''}`} /> */}
          </div>
        </div>
        <div className="col-2 p-0 m-0">
          <button
            className={`btn btn-primary rounded-0 search_button ${customClasses.searchButton}`}
            onClick={() => onSearchClick(query)}
          >
            {" "}
            <Search />{" "}
          </button>
        </div>
      </div>
      {query && query.length ? (
        <div className="row item-center">
          <div className="col-12 p-0 m-0">
            <div
              className={`options ${isOpen && options.length ? "open" : ""}`}
            >
              {filter(options).map((option, index) => {
                console.log(option, "optionxdcfvgbh");
                return (
                  <div
                    onClick={() => {
                      selectOption(option) || selectedOption(option);
                    }}
                    className={`option ${
                      option[label] === selectedVal ? "selected" : ""
                    }`}
                    key={`${id}-${index}`}
                  >
                    {/* {(option)} */}
                    {option.isCategory ? (
                      <div className="row m-0 option-item">
                        <div className="col-6 ">{option.name}</div>
                        <div className="col-6">
                          {" "}
                          <b> Category </b>{" "}
                        </div>
                      </div>
                    ) : (
                      <div className="row m-0 option-item">
                        <div className="col-6">{option.name}</div>
                        <div className="col-6">
                          {" "}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <b> Trainer </b>{" "}
                            {onlineUsers &&
                              (() => {
                                const trainerId =
                                  option?.id ||
                                  option?._id ||
                                  option?.userInfo?.trainer_id ||
                                  option?.trainer_id ||
                                  option?.userInfo?.id;
                                return Utils.isTrainerOnline(
                                  trainerId,
                                  onlineUsers
                                ) ? (
                                  <div
                                    className="dot-btn dot-danger grow"
                                    style={{
                                      marginLeft: "13px",
                                      marginTop: "-15px",
                                    }}
                                  ></div>
                                ) : null;
                              })()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default SearchableDropdown;
