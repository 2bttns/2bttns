import { Box, Textarea } from "@chakra-ui/react";

export type CustomCssEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function CustomCssEditor(props: CustomCssEditorProps) {
  const { value, onChange } = props;

  return (
    <>
      <Box height="100%" overflow="hidden" bgColor="white" flex={1}>
        <Textarea
          value={value}
          placeholder="Paste/Edit your CSS overrides here..."
          onChange={(e) => {
            onChange(e.target.value);
          }}
          height="calc(100% - 64px)"
          fontFamily={"mono"}
          fontSize="12px"
          backgroundColor="#222"
          color="#aaa"
        />
      </Box>
    </>
  );
}
