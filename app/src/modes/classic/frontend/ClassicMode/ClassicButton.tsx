import { Box, Button, ButtonProps, Code } from "@chakra-ui/react";
import ColorHash from "color-hash";

const colorHash = new ColorHash();

export type ClassicButtonProps = ButtonProps & {
  children: string;
  hotkey?: string;
  showColorBar?: boolean;
};

export default function ClassicButton(props: ClassicButtonProps) {
  const { children, hotkey, showColorBar, ...rest } = props;

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
      {showColorBar && (
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
      )}
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
            fontSize: "100%",
            fontWeight: "bold",
            maxWidth: "80%",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
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
