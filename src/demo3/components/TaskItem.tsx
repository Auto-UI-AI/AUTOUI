import { Card, CardContent, CardHeader, CardTitle } from "../../demo/base";

export type TaskItemType = { title: string; details: string };

const TaskItem = ({ title, details }: TaskItemType) => (
  <Card className="w-full">
    <CardHeader className="pb-2">
      <CardTitle className="text-base">{title}</CardTitle>
    </CardHeader>
    {details && (
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground">{details}</p>
      </CardContent>
    )}
  </Card>
);

export default TaskItem;
