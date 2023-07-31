import {
  Box,
  HStack,
  useRadio,
  useRadioGroup,
  UseRadioGroupProps,
  UseRadioProps,
} from "@chakra-ui/react";

export type RadioCardGroupProps = {
  options: string[];
  optionNameOverrides?: Record<string, string>;
  useRadioGroupProps?: UseRadioGroupProps;
};

export default function RadioCardGroup(props: RadioCardGroupProps) {
  const { options, useRadioGroupProps, optionNameOverrides } = props;
  const { getRootProps, getRadioProps } = useRadioGroup(useRadioGroupProps);
  const group = getRootProps();

  return (
    <HStack {...group}>
      {options.map((value) => {
        const radio = getRadioProps({ value });
        return (
          <RadioCard key={value} {...radio}>
            {optionNameOverrides?.[value] ?? value}
          </RadioCard>
        );
      })}
    </HStack>
  );
}

function RadioCard(props: UseRadioProps & { children: React.ReactNode }) {
  const { getInputProps, getCheckboxProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        _checked={{
          bg: "teal.600",
          color: "white",
          borderColor: "teal.600",
        }}
        _focus={{
          boxShadow: "outline",
        }}
        padding="4px 16px"
      >
        {props.children}
      </Box>
    </Box>
  );
}
