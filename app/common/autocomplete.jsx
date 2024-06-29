import Select from "react-select";
export const Autocomplete = ({
  options,
  name,
  isMulti,
  onChange,
  placeholder,
  isClearable,
  className,
}) => {
  return (
    <Select
      isMulti={isMulti}
      name={name}
      defaultOptions={options}
      onChange={onChange}
      isClearable={isClearable}
      placeholder={placeholder}
      options={options}
      className={className}
    />
  );
};
