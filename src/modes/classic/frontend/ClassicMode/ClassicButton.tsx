import { Box, Button, ButtonProps, Code } from "@chakra-ui/react";
import ColorHash from "color-hash";
import useFitText from "use-fit-text";

const colorHash = new ColorHash();

export type ClassicButtonProps = ButtonProps & {
  children: string;
  hotkey?: string;
};

export default function ClassicButton(props: ClassicButtonProps) {
  const { children, hotkey, ...rest } = props;

  const { fontSize, ref } = useFitText({
    maxFontSize: 150,
    logLevel: "none",
  });

  return (
    <Button
      {...rest}
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "1rem",
        padding: "2rem",
        height: "128px",
        width: { base: "90vw", md: "512px" },
        maxWidth: "100vw",
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.5)",
        ...rest.sx,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "32px",
          backgroundColor: colorHash.hex(children),
        }}
      />
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem",
        }}
      >
        <Box
          style={{
            fontSize,
            fontWeight: "bold",
            maxWidth: "80%",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          ref={ref}
        >
          {children}
        </Box>
        {hotkey && (
          <Code
            sx={{
              padding: "0.25rem 0.5rem",
              boxShadow: "0 4px 2px 0 rgba(0,0,0,0.25)",
              borderRadius: "4px",
            }}
          >
            {hotkey}
          </Code>
        )}
      </Box>
    </Button>
  );
}
