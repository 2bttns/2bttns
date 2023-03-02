export interface ModeUIProps {
  gameData: {
    game: Game;
    gameObjects: GameObject[];
  };
}

type ConfigComponentProps<Props extends ModeUIProps> = Props & {
  onConfigChange: (config: ClassicModeProps) => void;
};

type ModeUI<Props extends ModeUIProps> = {
  FrontendComponent: React.ComponentType<Props>;
  ConfigComponent?: React.ComponentType<ConfigComponentProps<Props>>;
};
