import { z } from "zod";

export const createOrganizationPricelistSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  active: z.boolean(),
});

export type CreateOrganizationPricelistFormValues = z.infer<
  typeof createOrganizationPricelistSchema
>;

export const createOrganizationPricelistDefaultValues: CreateOrganizationPricelistFormValues =
  {
    name: "",
    active: true,
  };

export function toCreateOrganizationPricelistPayload(
  values: CreateOrganizationPricelistFormValues,
) {
  return {
    name: values.name.trim(),
    active: values.active,
  };
}

export const updateOrganizationPricelistSchema = createOrganizationPricelistSchema;

export type UpdateOrganizationPricelistFormValues = CreateOrganizationPricelistFormValues;

export function toUpdateOrganizationPricelistFormValues(
  pricelist: OrganizationPricelistLike,
): UpdateOrganizationPricelistFormValues {
  return {
    name: pricelist.name,
    active: pricelist.is_active,
  };
}

export function toUpdateOrganizationPricelistPayload(
  values: UpdateOrganizationPricelistFormValues,
) {
  return toCreateOrganizationPricelistPayload(values);
}

type OrganizationPricelistLike = {
  name: string;
  is_active: boolean;
};
