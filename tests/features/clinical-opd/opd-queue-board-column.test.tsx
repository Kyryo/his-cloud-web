import { DndContext } from "@dnd-kit/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OpdQueueBoardColumn } from "@/features/clinical-opd/components/OpdQueueBoardColumn";

describe("OpdQueueBoardColumn", () => {
  it("mutes earlier stages while a card is dragged", () => {
    render(
      <DndContext>
        <OpdQueueBoardColumn
          column={{ stage: "registered", label: "Registered", encounters: [] }}
          draggingStage="with_clinician"
          movingId={null}
          onOpen={() => undefined}
        />
      </DndContext>,
    );

    expect(screen.getByTestId("opd-queue-board-column-registered")).toHaveAttribute(
      "data-muted",
      "earlier",
    );
    expect(screen.getByText("Can't move back")).toBeInTheDocument();
  });
});
