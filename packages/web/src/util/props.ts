export type PropsOf<Cmp> = Cmp extends React.FC<infer T> ? T : never;
