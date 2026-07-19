using MalirTonight.UI.ViewModels;

namespace MalirTonight.UI.Views;

public partial class ExpenseListView : System.Windows.Controls.UserControl
{
    public ExpenseListView(ExpenseListViewModel viewModel)
    {
        InitializeComponent();
        DataContext = viewModel;
        Loaded += async (_, _) => await viewModel.LoadCommand.ExecuteAsync(null);
    }
}
