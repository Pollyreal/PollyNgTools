import { OverlayRef } from "@angular/cdk/overlay";

/**
 * The login loading ref is used to handle the loading
 * for a loading.
 * It is returned from invoking to show the loading.
 */
export class CommonLoadingRef {
  constructor(
    private readonly overlayRef: OverlayRef
  ) { }

  /**
   * Closes the overlay for the loader.
   */
  public close(): void {
    this.overlayRef.dispose();
  }
}
