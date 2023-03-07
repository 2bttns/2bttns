import { Game, GameObject } from "@prisma/client";

export interface ModeUIProps<ConfigProps> {
  gameData: {
    playerId: string;
    game: Game;
    gameObjects:
      | { type: "preload"; payload: { gameObjects: GameObject[] } }
      | {
          type: "load-on-demand";
          payload: {
            totalNumItemsToLoad: number;
          };
        };
  };
  config: ConfigProps;
}

type ConfigComponentProps<ConfigProps> = {
  config?: ConfigProps;
} & {
  onConfigChange: (config: ClassicModeProps) => void;
};

type ModeUI<ConfigProps extends ModeUIProps> = {
  FrontendComponent: React.ComponentType<ConfigProps>;
  ConfigComponent?: React.ComponentType<ConfigComponentProps<ConfigProps>>;
};
