const Producto = require('../models/product');
const AlmacenTemp = require('../models/almacen_temp');

// Obtener todos los productos
exports.getProducts = async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    res.status(500).send('Error al obtener productos');
  }
};

// Crear un nuevo producto
exports.addProduct = async (req, res) => {
  const { nombre, descripcion = '', precio, categoria = 'General', stock = 0, imagenes = [] } = req.body;
  try {
    const nuevoProducto = new Producto({
      nombre,
      descripcion,
      precio,
      categoria,
      stock,
      imagenes
    });
    await nuevoProducto.save();
    res.json(nuevoProducto);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al crear producto');
  }
};

// Editar un producto
exports.updateProduct = async (req, res) => {
  try {
    const productoActualizado = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(productoActualizado);
  } catch (error) {
    res.status(500).send('Error al actualizar producto');
  }
};

// Eliminar un producto
exports.deleteProduct = async (req, res) => {
  try {
    await Producto.findByIdAndDelete(req.params.id);
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).send('Error al eliminar producto');
  }
};

// Migrar productos desde AlmacenTemp a Productos consolidando stock
exports.migrarDesdeAlmacenTemp = async (req, res) => {
  try {
    await Producto.deleteMany({});

    const registros = await AlmacenTemp.find();
    console.log('Contenido de AlmacenTemp:', registros);

    const productosMap = new Map();

    registros.forEach(registro => {
      registro.data.forEach(item => {
        const rawNombre = item['__EMPTY_5'];
        if (!rawNombre) return;

        const rawPrecio = item['__EMPTY_9'];
        let precio = 0;

        if (rawPrecio) {
          precio = parseFloat(rawPrecio.toString().replace(/[^\d,.-]/g, '').replace(',', '.'));
          if (isNaN(precio)) precio = 0;
        }

        const stock = parseFloat(item['__EMPTY_8']) || 0;

        const nombreKey = rawNombre
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, ' ')
          .replace(/[^\w\s.-]/g, '');

        if (productosMap.has(nombreKey)) {
          productosMap.get(nombreKey).stock += stock;
        } else {
          productosMap.set(nombreKey, {
            nombre: rawNombre.trim(),
            descripcion: 'Cargado desde Excel',
            precio,
            categoria: 'General',
            stock,
            imagenes: []
          });
        }
      });
    });

    const productosFinales = Array.from(productosMap.values());

    if (productosFinales.length === 0) {
      return res.status(400).json({ message: 'No se encontraron productos válidos para migrar' });
    }

    await Producto.insertMany(productosFinales);
    await AlmacenTemp.deleteMany({});

    res.status(200).json({ message: 'Productos migrados correctamente', cantidad: productosFinales.length });

  } catch (error) {
    console.error('Error migrando productos:', error);
    res.status(500).json({ message: 'Error al migrar productos', error });
  }
};
