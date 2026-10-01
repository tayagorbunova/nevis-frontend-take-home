import type { Examples, ExamplesMeta } from "../examples";

import { Avatar } from "./Avatar";

export const meta: ExamplesMeta = { title: "Avatar" };

function WithAPhoto() {
  return (
    <>
      <Avatar name="Anna Blackwood" src="/avatars/anna-blackwood.jpg" />
      Anna Blackwood
    </>
  );
}

function NoPhoto() {
  return (
    <>
      <Avatar name="James Walker" />
      James Walker
    </>
  );
}

export const examples: Examples = { WithAPhoto, NoPhoto };
