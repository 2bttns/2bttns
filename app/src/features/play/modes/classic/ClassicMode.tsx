export type ClassicModeProps = {
  name: string;
};

export default function ClassicMode(props: ClassicModeProps) {
  const { name } = props;
  return (
    <div>
      <h1>Classic Mode - {name}</h1>
    </div>
  );
}
