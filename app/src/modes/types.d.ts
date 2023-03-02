export interface ModeUIProps<ConfigProps> {
  gameData: {
    game: Game;
    gameObjects: GameObject[];
  };
  config: ConfigProps;
}

type ConfigComponentProps<Props extends ModeUIProps> = Props & {
  onConfigChange: (config: ClassicModeProps) => void;
};

type ModeUI<Props extends ModeUIProps> = {
  FrontendComponent: React.ComponentType<Props>;
  ConfigComponent?: React.ComponentType<ConfigComponentProps<Props>>;
};
