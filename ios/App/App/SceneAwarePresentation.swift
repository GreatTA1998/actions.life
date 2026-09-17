import UIKit
import Capacitor

/// Capacitor 7's `presentVC` builds a `UIWindow(frame:)` that is not attached to a
/// `UIWindowScene`. After this app adopted the UIKit scene lifecycle, that window
/// never appears — SFSafariViewController loads (logs prove it) but the screen
/// stays on the homepage. Present from the scene-hosted bridge instead.
enum SceneAwarePresentation {
    static func hook() {
        let originalSelector = NSSelectorFromString("presentVC:animated:completion:")
        let swizzledSelector = #selector(CapacitorBridge.sceneAware_presentVC(_:animated:completion:))
        guard
            let originalMethod = class_getInstanceMethod(CapacitorBridge.self, originalSelector),
            let swizzledMethod = class_getInstanceMethod(CapacitorBridge.self, swizzledSelector)
        else {
            NSLog("SceneAwarePresentation: failed to find presentVC methods")
            return
        }
        method_exchangeImplementations(originalMethod, swizzledMethod)
        NSLog("SceneAwarePresentation: hooked CapacitorBridge.presentVC")
    }
}

extension CapacitorBridge {
    @objc func sceneAware_presentVC(_ viewControllerToPresent: UIViewController, animated flag: Bool, completion: (() -> Void)?) {
        let present = {
            guard var presenter = self.viewController else {
                NSLog("SceneAwarePresentation: no bridge viewController; falling back")
                self.sceneAware_presentVC(viewControllerToPresent, animated: flag, completion: completion)
                return
            }
            while let presented = presenter.presentedViewController {
                presenter = presented
            }
            NSLog("SceneAwarePresentation: presenting \(type(of: viewControllerToPresent)) from \(type(of: presenter))")
            presenter.present(viewControllerToPresent, animated: flag, completion: completion)
        }
        if Thread.isMainThread {
            present()
        } else {
            DispatchQueue.main.async(execute: present)
        }
    }
}
