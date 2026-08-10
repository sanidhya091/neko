from PIL import Image
import os

def process_sprite_sheet(image_path, output_path, num_frames, frame_size=(128, 128)):
    try:
        img = Image.open(image_path).convert("RGBA")
    except Exception as e:
        print(f"Failed to load {image_path}: {e}")
        return

    # The generated images have a "fake" checkerboard. 
    # We'll try to remove it by making the lightest colors transparent.
    datas = img.getdata()
    new_data = []
    for item in datas:
        # If the pixel is very bright (white/light gray checkerboard), make it transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    img.putdata(new_data)

    # Find bounding box of non-transparent content
    bbox = img.getbbox()
    if not bbox:
        print(f"No content found in {image_path}")
        return
    
    # Crop to content
    cropped = img.crop(bbox)
    w, h = cropped.size
    
    # Slice into frames
    frame_w = w // num_frames
    final_sheet = Image.new("RGBA", (frame_size[0] * num_frames, frame_size[1]))
    
    for i in range(num_frames):
        left = i * frame_w
        right = (i + 1) * frame_w
        frame = cropped.crop((left, 0, right, h))
        
        # Resize frame to fit within frame_size while maintaining aspect ratio
        aspect = frame.width / frame.height
        if aspect > 1:
            new_w = frame_size[0]
            new_h = int(new_w / aspect)
        else:
            new_h = frame_size[1]
            new_w = int(new_h * aspect)
            
        resized_frame = frame.resize((new_w, new_h), Image.NEAREST)
        
        # Paste into final sheet, centered horizontally and bottom-aligned
        paste_x = i * frame_size[0] + (frame_size[0] - new_w) // 2
        paste_y = frame_size[1] - new_h
        final_sheet.paste(resized_frame, (paste_x, paste_y), resized_frame)
        
    final_sheet.save(output_path)
    print(f"Saved sprite sheet to {output_path}")

# Process all animations
animations = [
    ("neko_idle.png", 4),
    ("neko_walk.png", 6),
    ("neko_sleep.png", 4),
    ("neko_stretch_v2.png", 4),
    ("neko_look_v2.png", 4)
]

base_path = "/home/ubuntu/project-neko/src/assets/pets/neko/sprites/"

for filename, frames in animations:
    input_p = os.path.join(base_path, filename)
    output_p = os.path.join(base_path, filename.replace(".png", "_final.png").replace("_v2", ""))
    process_sprite_sheet(input_p, output_p, frames)
