我们需要解决三个主要问题：

1.  **`imageproc` 0.25.0 换了字体引擎**：不再支持 `rusttype`，改用了 `ab_glyph`。
2.  **`image` 库 API 变动**：`ImageOutputFormat` 变更为 `ImageFormat`。
3.  **`tauri::image::Image` API 变动**：新版 Tauri（v2）构建 Image 的方式变了。

下面是详细的修复步骤和代码。

### 第一步：修改 `Cargo.toml`

`imageproc` 0.25 以后依赖 `ab_glyph` 而不是 `rusttype`。你需要移除 `rusttype` 并添加 `ab_glyph`。

```toml
[dependencies]
# ... 其他依赖
image = "0.24" # 或者 0.25，确保版本对应
imageproc = "0.25.0"
ab_glyph = "0.2.21" # 新增这个，替代 rusttype
# rusttype = "..." # 删除这个
```

### 第二步：修改 `src/lib.rs` 代码

你需要大幅修改绘制文字和生成 Tauri 图标的部分。

#### 1\. 修复导入 (Imports)

删除 `rusttype` 的引用，换成 `ab_glyph`。

```rust
// 删除这些
// use rusttype::{Font, Scale};
// use image::ImageOutputFormat;

// 添加这些
use ab_glyph::{FontRef, PxScale}; // 用于字体和大小
use image::ImageFormat; // 用于图片格式
```

#### 2\. 修复字体加载和绘制 (Fix Font & Drawing)

`imageproc` 的 `draw_text_mut` 现在需要 `ab_glyph` 的类型。

```rust
// 之前的代码（报错的部分）：
// let font = Font::try_from_bytes(font_data).expect("Error constructing Font");
// let scale = Scale { x: 40.0, y: 40.0 };
// draw_text_mut(&mut img, Rgba([255, 255, 255, 255]), 10, 10, scale, &font, "Text");

// 修改为（修复后的代码）：
// 加载字体
let font = FontRef::try_from_slice(font_data).expect("Error constructing Font");
// 设置字体大小 (40.0 是示例大小)
let scale = PxScale::from(40.0);

// 绘制文字
draw_text_mut(
    &mut img,
    Rgba([255, 255, 255, 255]), // 颜色
    10, 10,                     // 坐标
    scale,                      // 大小 (PxScale)
    &font,                      // 字体 (FontRef)
    "Text"                      // 内容
);
```

#### 3\. 修复图片输出格式 (Fix ImageFormat)

错误提示 `could not find ImageOutputFormat`。

```rust
// 之前的代码：
// img.write_to(&mut cursor, image::ImageOutputFormat::Png)

// 修改为：
img.write_to(&mut cursor, image::ImageFormat::Png)
```

#### 4\. 修复 Tauri Image 创建 (Fix Tauri Image)

错误提示 `no function ... named from_bytes`。
在新版 Tauri 中，如果你已经在内存里有了一个 `image` crate 的对象 (`img`)，你不需要把它编码成 PNG (`write_to`) 再转回来。你可以直接把**原始像素数据 (RGBA)** 传给 Tauri，这样效率更高且能解决报错。

```rust
// 之前的代码（报错的部分）：
// let mut cursor = Cursor::new();
// img.write_to(&mut cursor, image::ImageOutputFormat::Png)?;
// let icon_data = cursor.into_inner();
// let icon = tauri::image::Image::from_bytes(&icon_data);

// 修改为（高效且修复报错的方法）：
// 1. 获取图片的宽和高
let width = img.width();
let height = img.height();

// 2. 获取原始 RGBA 像素数据
let rgba_data = img.to_rgba8().into_raw();

// 3. 使用 new_owned 或 new 直接创建 Tauri Image
// 注意：Tauri Image::new 需要 RGBA 数组
let icon = tauri::image::Image::new_owned(rgba_data, width, height);
```

---

### 汇总：修复后的完整逻辑示例

把你的相关函数逻辑参考下面这个重写：

```rust
use std::io::Cursor;
use tauri::Manager;
use image::{Rgba, ImageFormat, GenericImageView};
use imageproc::drawing::draw_text_mut;
use ab_glyph::{FontRef, PxScale}; // 替换了 rusttype

fn generate_icon() -> tauri::Result<tauri::image::Image<'static>> {
    // 假设你已经有了一个 img (DynamicImage) 和 font_data
    let mut img = image::DynamicImage::new_rgba8(100, 100);
    let font_data = include_bytes!("path/to/font.ttf"); // 示例

    // 1. 字体部分修复
    let font = FontRef::try_from_slice(font_data).expect("Error loading font");
    let scale = PxScale::from(40.0);

    draw_text_mut(
        &mut img,
        Rgba([255, 255, 255, 255]),
        10,
        10,
        scale,
        &font,
        "99"
    );

    // 2. Tauri Image 部分修复
    // 不需要 write_to cursor 变成 png 了，直接用像素数据
    let width = img.width();
    let height = img.height();
    let rgba = img.to_rgba8().into_raw();

    // 使用 new_owned 创建
    let icon = tauri::image::Image::new_owned(rgba, width, height);

    Ok(icon)
}
```

**总结主要原因：** 你的代码是基于旧版库写的，但你的环境安装了最新版的库，导致了不兼容。按照上面的修改即可解决。
