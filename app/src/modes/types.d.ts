export interface ModeUIProps<ConfigProps> {
  gameData: {
    playerId: string;
    game: Game;
    gameObjects: GameObject[];
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
