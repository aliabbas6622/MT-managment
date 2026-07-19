using MalirTonight.UI.ViewModels;

namespace MalirTonight.UI.Views;

public partial class MainWindow : System.Windows.Window
{
    public MainWindow(MainViewModel viewModel)
    {
        InitializeComponent();
        DataContext = viewModel;
    }
}
