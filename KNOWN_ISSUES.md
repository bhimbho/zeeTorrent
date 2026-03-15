# Known issues

## macOS 26 (Tahoe) – app crashes on startup

On **macOS 26 (Tahoe)**, the app can crash immediately on launch with:

- **Location:** `tao::platform_impl::platform::app_delegate::did_finish_launching` (around line 125–126)
- **Cause:** `MainThreadMarker::new().unwrap()` panics due to a change in macOS 26’s app lifecycle.

This comes from the **tao** windowing library used by Tauri. It is tracked upstream:

- **Issue:** [tauri-apps/tao#1171 – App crashes on startup on macOS 26 Tahoe](https://github.com/tauri-apps/tao/issues/1171)

**Workarounds until tao is fixed:**

- Run wtorrent on **macOS 15 (Sequoia)** or earlier, or  
- Watch the issue above for an upstream fix and update Tauri/tao when a release includes it.
