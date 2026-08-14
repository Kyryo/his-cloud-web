type DepartmentOption = {
  uuid: string;
};

export function resolveDefaultDepartmentUuid(
  departments: DepartmentOption[],
): string {
  return departments.length === 1 ? departments[0].uuid : "";
}
