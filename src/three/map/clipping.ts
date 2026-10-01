import { Plane, Vector3 } from "three";
import { SPREAD } from "../constants";

/** World-space clip planes that keep map content inside the margins of the open spread. */
export const spreadClipPlanes = [
  new Plane(new Vector3(-1, 0, 0), SPREAD.xMax),
  new Plane(new Vector3(1, 0, 0), SPREAD.xMax),
  new Plane(new Vector3(0, 0, -1), SPREAD.zMax),
  new Plane(new Vector3(0, 0, 1), SPREAD.zMax),
];
