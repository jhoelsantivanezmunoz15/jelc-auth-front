export interface MenuNode {
  id: string;
  name: string;
  icon: string | null;
  route: string | null;
  order: number | null;
  children: MenuNode[];
}
