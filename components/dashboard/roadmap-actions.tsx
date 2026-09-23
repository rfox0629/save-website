"use client";

import { useState } from "react";

import {
  ErrorText,
  postJson,
  useAction,
} from "@/components/dashboard/workspace-actions";
import {
  Btn,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/save/primitives";
import {
  ROADMAP_CATEGORIES,
  ROADMAP_STATUSES,
  ROADMAP_STATUS_LABELS,
} from "@/lib/roadmap-shared";

/**
 * Staff-side roadmap controls. Statuses come from the database's own check
 * constraint, so the form cannot offer a value the record will reject.
 */

export function AddRoadmapItemForm({
  applicationId,
}: {
  applicationId: string;
}) {
  const { error, pending, run } = useAction();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [category, setCategory] = useState("");
  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState("");

  if (!open) {
    return (
      <Btn onClick={() => setOpen(true)} size="sm" variant="secondary">
        Add a roadmap item
      </Btn>
    );
  }

  return (
    <div className="space-y-4">
      <Field
        help="What the ministry needs to close, in their language rather than ours."
        label="Title"
        required
      >
        <Input
          onChange={(event) => setTitle(event.target.value)}
          value={title}
        />
      </Field>

      <Field label="Detail">
        <Textarea
          onChange={(event) => setDetail(event.target.value)}
          rows={3}
          value={detail}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Category">
          <Select
            onChange={(event) => setCategory(event.target.value)}
            value={category}
          >
            <option value="">Not categorised</option>
            {ROADMAP_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Owner">
          <Input
            onChange={(event) => setOwner(event.target.value)}
            placeholder="Who owns it"
            value={owner}
          />
        </Field>
        <Field label="Due">
          <Input
            onChange={(event) => setDueDate(event.target.value)}
            type="date"
            value={dueDate}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <Btn
          disabled={pending || !title.trim()}
          onClick={async () => {
            const ok = await run(
              () =>
                postJson(`/api/applications/${applicationId}/roadmap`, {
                  category: category || undefined,
                  detail,
                  dueDate: dueDate || undefined,
                  owner,
                  title,
                }),
              "Unable to save the roadmap item.",
            );
            if (ok) {
              setTitle("");
              setDetail("");
              setCategory("");
              setOwner("");
              setDueDate("");
              setOpen(false);
            }
          }}
          size="sm"
        >
          {pending ? "Saving…" : "Save item"}
        </Btn>
        <Btn onClick={() => setOpen(false)} size="sm" variant="ghost">
          Cancel
        </Btn>
      </div>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

export function RoadmapStatusControl({
  applicationId,
  current,
  itemId,
}: {
  applicationId: string;
  current: string;
  itemId: string;
}) {
  const { error, pending, run } = useAction();

  return (
    <div className="min-w-[180px]">
      <Select
        disabled={pending}
        onChange={(event) =>
          run(
            () =>
              postJson(`/api/applications/${applicationId}/roadmap/${itemId}`, {
                status: event.target.value,
              }),
            "Unable to update the item.",
          )
        }
        value={current}
      >
        {ROADMAP_STATUSES.map((status) => (
          <option key={status} value={status}>
            {ROADMAP_STATUS_LABELS[status]}
          </option>
        ))}
      </Select>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

/**
 * Sharing findings with the ministry. The database default is "not shared", so
 * nothing reaches a ministry until a reviewer does this deliberately.
 */
export function ShareFindingsControl({
  applicationId,
  sharedAt,
}: {
  applicationId: string;
  sharedAt: string | null;
}) {
  const { error, pending, run } = useAction();
  const shared = Boolean(sharedAt);

  return (
    <div>
      <Btn
        disabled={pending}
        onClick={() =>
          run(
            () =>
              postJson(`/api/applications/${applicationId}/roadmap`, {
                action: "set_findings_shared",
                shared: !shared,
              }),
            "Unable to change findings sharing.",
          )
        }
        size="sm"
        variant={shared ? "ghost" : "secondary"}
      >
        {pending
          ? "Saving…"
          : shared
            ? "Withdraw findings from the ministry"
            : "Share findings with the ministry"}
      </Btn>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}
