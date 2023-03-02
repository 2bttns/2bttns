export interface ModeUIProps<ConfigProps> {
  gameData: {
    playerId: string;
    game: Game;
    gameObjects: GameObject[];
  };
  config: ConfigProps;
}

type ConfigComponentProps<Props> = ModeUIProps<Props>["config"] & {
  onConfigChange: (config: ClassicModeProps) => void;
};

type ModeUI<Props extends ModeUIProps> = {
  FrontendComponent: React.ComponentType<Props>;
  ConfigComponent?: React.ComponentType<ConfigComponentProps<Props["config"]>>;
};
