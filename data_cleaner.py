import kagglehub
from pathlib import Path
from PIL import Image, UnidentifiedImageError
import pandas as pd 

path = kagglehub.dataset_download("ucimachinelearning/breast-cancer-histology-images")
file_path = Path(path)/"histology_dataset"

datatable = []

for file in file_path.iterdir():
    for image in file.iterdir():
        image_path_name = image.name
        image_folder_name = file.name
        image_extension = image.suffix
        try:
            img = Image.open(image)
            is_corrupt = False
            file_size_width = img.size[0] 
            file_size_height = img.size[1] 
            file_size = image.stat().st_size 
        except UnidentifiedImageError:
            is_corrupt = True
            file_size_width = None
            file_size_height = None
            file_size = None

        datatable.append({"image_path_name": image_path_name, "image_folder_name": image_folder_name, "image_extension": image_extension, "is_corrupt": is_corrupt, "file_size_width": file_size_width, "file_size_height": file_size_height, "file_size": file_size})

df = pd.DataFrame(datatable)
df = df[(df["is_corrupt"] == False) & (df["file_size"] > 0) & (df["file_size_width"] >= 32) & (df["file_size_height"] >= 32)]
print (df.shape)
print(df[df.duplicated(subset=["image_path_name"])])
