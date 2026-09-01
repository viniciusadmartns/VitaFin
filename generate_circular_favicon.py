"""
Gerador de Favicon Circular para VitaFin
Cria um favicon circular a partir da logo existente
"""

from PIL import Image, ImageDraw

def create_circular_favicon(input_path, output_path, size=32):
    """Cria um favicon circular com fundo branco"""

    # Carregar a imagem original
    logo = Image.open(input_path).convert('RGBA')

    # Criar uma nova imagem com fundo branco
    favicon = Image.new('RGBA', (size, size), (255, 255, 255, 255))

    # Redimensionar a logo mantendo proporção
    logo_resized = logo.resize((size, size), Image.Resampling.LANCZOS)

    # Criar máscara circular
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size, size), fill=255)

    # Aplicar a máscara circular na logo
    logo_circular = Image.new('RGBA', (size, size), (255, 255, 255, 255))
    logo_circular.paste(logo_resized, (0, 0), mask)

    # Salvar o favicon
    logo_circular.save(output_path, 'PNG')
    print(f"✓ Favicon {size}x{size} criado: {output_path}")

if __name__ == '__main__':
    logo_path = r"C:\Users\Vinicius D'avila\Documents\Omniroute\img\logo.png"

    # Gerar múltiplos tamanhos
    sizes = [16, 32, 64, 180]

    for size in sizes:
        output_path = r"C:\Users\Vinicius D'avila\Documents\Omniroute\public\favicon.png"
        if size != 32:
            output_path = output_path.replace('favicon.png', f'favicon-{size}.png')

        create_circular_favicon(logo_path, output_path, size)

    print("\n✓ Todos os favicons circulares foram gerados!")
    print("✓ Substitua o arquivo public/favicon.png pelo novo gerado")
