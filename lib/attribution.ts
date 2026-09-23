/**
 * Who did this, recorded so it outlives them.
 *
 * A staff member leaving SAVE must not make a historical action anonymous. The
 * live foreign key resolves the current identity and is the right thing to read
 * while the person is still here; it becomes null the moment the identity goes.
 * The snapshot is the durable record: the actor's id, display name and email as
 * they were at the moment of the action.
 *
 * Snapshots are written at the action and never afterwards. Populating one
 * lazily — when a record is next viewed or edited — would attribute the action
 * to whoever happened to open it, which is worse than leaving it blank.
 *
 * Convention: for a live actor column `<role>_by` or `<role>_id`, the snapshot
 * columns are `<role>_actor_id`, `<role>_actor_name`, `<role>_actor_email`.
 */

export type ActorIdentity = {
  email: string | null;
  id: string;
  name: string | null;
};

export type ActorSnapshot = Record<string, string | null>;

/**
 * Reads a display name from whatever the auth provider holds. SAVE does not
 * collect staff names today, so this is usually null and the email carries the
 * identification — recorded honestly rather than invented.
 */
export function readActorName(
  metadata: Record<string, unknown> | null | undefined,
): string | null {
  if (!metadata) return null;

  for (const key of ["full_name", "name", "display_name"]) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

export function toActorIdentity(user: {
  email?: string | null;
  id: string;
  user_metadata?: Record<string, unknown> | null;
}): ActorIdentity {
  return {
    email: user.email ?? null,
    id: user.id,
    name: readActorName(user.user_metadata),
  };
}

/**
 * The snapshot columns for one actor column. Returns nothing when there is no
 * actor: an absent snapshot is honest, an invented one is not.
 */
export function buildActorSnapshot(
  role: string,
  actor: ActorIdentity | null | undefined,
): ActorSnapshot {
  if (!actor?.id) {
    return {};
  }

  return {
    [`${role}_actor_email`]: actor.email ?? null,
    [`${role}_actor_id`]: actor.id,
    [`${role}_actor_name`]: actor.name ?? null,
  };
}
